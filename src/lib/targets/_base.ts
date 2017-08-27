import {existsSync} from "fs";
import {Gulp, TaskFunction} from "gulp";
import * as gulpUtil from "gulp-util";
import {Minimatch} from "minimatch";
import {posix as posixPath} from "path";
import {Readable as ReadableStream} from "stream";
import * as typescript from "typescript";
import {CleanOptions} from "../options/clean";
import {CopyOptions} from "../options/copy";
import {CompilerOptionsJson, DEV_TSC_OPTIONS, mergeTscOptionsJson} from "../options/tsc";
import {Project, ResolvedProject, resolveProject} from "../project";
import {generateCopyTasks, ManyWatchFunction} from "../target-generators/base";
import {TypescriptConfig} from "../target-tasks/_typescript";
import {getBuildTypescriptTask} from "../target-tasks/build-typescript";
import {getTsconfigJsonTask} from "../target-tasks/tsconfig-json";
import {CleanOptions as _CleanOptions, generateTask as generateCleanTask} from "../task-generators/clean";
import {AbsPosixPath, RelPosixPath} from "../types";
import * as matcher from "../utils/matcher";

export interface TargetBase {
  /**
   * Name of the target.
   * All the tasks related to this target will be prefixed by this name.
   * It will also be used to resolve the default values for some paths, so it must avoid any special characters.
   */
  name: string;

  /**
   * Relative path to the base directory for the sources, relative to `project.rootDir`.
   * The default value is `project.srcDir`.
   */
  srcDir?: RelPosixPath;

  /**
   * Relative path to the build directory for this target, relative to `project.rootDir`.
   * The default value is `join(project.buildDir, target.name)`.
   */
  buildDir?: RelPosixPath;

  /**
   * Glob patterns for the Typescript sources, relative to `target.srcDir`.
   *
   * It uses the `minimatch` patterns. Glob stars (wild stars, `**`) use `target.srcDir` as their base directory.
   *
   * Default: `[join(target.srcDir, "**", "*.ts")]`
   */
  scripts?: Iterable<string>;

  /**
   * Directory containing custom typings, relative to `project.rootDir`.
   * Custom typings are typings that are not available on `@types`.
   * `null` means that you don't use custom typings.
   * The default value will be `join(target.srcDir, "custom-typings")` if it exists (sync test), else `null`.
   */
  customTypingsDir?: RelPosixPath | null;

  /**
   * Overrides for the options of the Typescript compiler.
   */
  tscOptions?: CompilerOptionsJson;

  /**
   * Path to the `tsconfig.json` file for this target, relative to `project.rootDir`.
   * Use `null` to not generate a `tsconfig.json` task.
   *
   * The default value is `join(target.srcDir, "tsconfig.json")`.
   */
  tsconfigJson?: RelPosixPath | null;

  /**
   * Override default dependencies or provide optional dependencies.
   */
  dependencies?: BaseDependencies;

  /**
   * A list of copy operations to perform during the build process.
   *
   * Default: `[]`
   */
  copy?: CopyOptions[];

  /**
   * Minimatch patterns to clean the files create during the `build` and `dist` tasks, relative to `project.root`.
   *
   * Default:
   * {
   *   dirs: [
   *     path.join(project.buildDir, target.targetDir),
   *     path.join(project.distDir, target.targetDir)
   *   ]
   * }
   */
  clean?: CleanOptions;
}

/**
 * Library with fully resolved paths and dependencies.
 */
export interface ResolvedTargetBase extends TargetBase {
  readonly srcDir: AbsPosixPath;

  readonly buildDir: AbsPosixPath;

  readonly scripts: Iterable<string>;

  readonly customTypingsDir: AbsPosixPath | null;

  readonly tscOptions: CompilerOptionsJson;

  readonly tsconfigJson: AbsPosixPath | null;

  readonly dependencies: ResolvedBaseDependencies;

  readonly copy?: CopyOptions[];

  readonly clean?: CleanOptions;
}

export interface BaseDependencies {
  readonly typescript?: typeof typescript;
}

/**
 * Fully resolved dependencies, either using defaults or the library provided by the user.
 */
export interface ResolvedBaseDependencies extends BaseDependencies {
  readonly typescript: typeof typescript;
}

/**
 * Resolve absolute paths and dependencies for the provided target.
 *
 * @param project Project to use.
 * @param target Non-resolved target.
 * @return Resolved target.
 */
export function resolveTargetBase(project: ResolvedProject, target: TargetBase): ResolvedTargetBase {
  const srcDir: AbsPosixPath = typeof target.srcDir === "string" ?
    posixPath.join(project.absRoot, target.srcDir) :
    project.srcDir;

  const buildDir: AbsPosixPath = typeof target.buildDir === "string" ?
    posixPath.join(project.absRoot, target.buildDir) :
    posixPath.join(project.absBuildDir, target.name);

  const scripts: string[] = [];
  if (target.scripts === undefined) {
    scripts.push(posixPath.join(srcDir, "**", "*.ts"));
  } else {
    for (const script of target.scripts) {
      scripts.push(matcher.asString(matcher.join(srcDir, new Minimatch(script))));
    }
  }

  const defaultCustomTypingsDir: AbsPosixPath = posixPath.join(srcDir, "custom-typings");

  const customTypingsDir: AbsPosixPath | null = target.customTypingsDir !== undefined ?
    (target.customTypingsDir !== null ? posixPath.join(project.absRoot, target.customTypingsDir) : null) :
    (existsSync(defaultCustomTypingsDir) ? defaultCustomTypingsDir : null);

  const tscOptions: CompilerOptionsJson = mergeTscOptionsJson(DEV_TSC_OPTIONS, target.tscOptions);

  const tsconfigJson: AbsPosixPath | null = target.tsconfigJson !== undefined ?
    (target.tsconfigJson !== null ? posixPath.join(project.absRoot, target.tsconfigJson) : null) :
    posixPath.join(srcDir, "tsconfig.json");

  const dependencies: ResolvedBaseDependencies = {
    typescript: typescript,
  };
  if (target.dependencies !== undefined) {
    Object.assign(dependencies, target.dependencies);
  }

  return {
    name: target.name,
    srcDir,
    buildDir,
    scripts,
    customTypingsDir,
    tscOptions,
    tsconfigJson,
    dependencies,
    copy: target.copy,
    clean: target.clean,
  };
}

export function addTask(gulp: Gulp, displayName: string, task: TaskFunction): TaskFunction {
  task.displayName = displayName;
  gulp.task(task);
  return task;
}

export function gulpBufferSrc(filename: string, data: Buffer): NodeJS.ReadableStream {
  const src: ReadableStream = new ReadableStream({objectMode: true});
  src._read = function () {
    this.push(new gulpUtil.File({
      cwd: "",
      base: "",
      path: filename,
      contents: data,
    }));
    this.push(null);
  };
  return src;
}

export interface BaseTasks {
  buildScripts: TaskFunction;
  buildCopy?: TaskFunction;
  build: TaskFunction;
  clean?: TaskFunction;
  tsconfigJson?: TaskFunction;
}

/**
 * Generates and registers gulp tasks for the provided lib target.
 *
 * @param gulp Gulp instance where the tasks will be registered.
 * @param project Project configuration.
 * @param target Target configuration.
 */
export function registerBaseTasks(gulp: Gulp, project: Project, target: TargetBase): BaseTasks {
  const resolvedProject: ResolvedProject = resolveProject(project);
  const resolvedTarget: ResolvedTargetBase = resolveTargetBase(resolvedProject, target);

  const result: BaseTasks = <any> {};

  const tsOptions: TypescriptConfig = {
    tscOptions: resolvedTarget.tscOptions,
    tsconfigJson: resolvedTarget.tsconfigJson,
    customTypingsDir: resolvedTarget.customTypingsDir,
    packageJson: resolvedProject.absPackageJson,
    buildDir: resolvedTarget.buildDir,
    srcDir: resolvedTarget.srcDir,
    scripts: resolvedTarget.scripts,
  };

  const buildTasks: TaskFunction[] = [];

  // build:scripts
  result.buildScripts = addTask(gulp, `${target.name}:build:scripts`, getBuildTypescriptTask(gulp, tsOptions));
  buildTasks.push(result.buildScripts);

  // build:copy
  if (resolvedTarget.copy !== undefined) {
    const [copyTask, copyWatchers]: [TaskFunction, ManyWatchFunction] = generateCopyTasks(
      gulp,
      resolvedTarget.srcDir,
      resolvedTarget.buildDir,
      resolvedTarget.copy,
    );
    result.buildCopy = addTask(gulp, `${target.name}:build:copy`, copyTask);
    buildTasks.push(result.buildCopy);
  }

  // build
  result.build = addTask(gulp, `${target.name}:build`, gulp.parallel(buildTasks));

  // clean
  if (resolvedTarget.clean !== undefined) {
    const cleanOptions: _CleanOptions = {
      base: resolvedProject.absRoot,
      dirs: resolvedTarget.clean.dirs,
      files: resolvedTarget.clean.files,
    };
    result.clean = addTask(gulp, `${target.name}:clean`, generateCleanTask(gulp, cleanOptions));
  }

  // tsconfig.json
  if (resolvedTarget.tsconfigJson !== null) {
    result.tsconfigJson = addTask(gulp, `${target.name}:tsconfig.json`, getTsconfigJsonTask(tsOptions));
  }

  return result;
}
