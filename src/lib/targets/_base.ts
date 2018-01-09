import { existsSync, FSWatcher } from "fs";
import { Gulp, TaskFunction } from "gulp";
import { Minimatch } from "minimatch";
import { posix as posixPath } from "path";
import { Readable as ReadableStream } from "stream";
import * as typescript from "typescript";
import Vinyl from "vinyl";
import { CleanOptions } from "../options/clean";
import { CopyOptions } from "../options/copy";
import { CompilerOptionsJson, DEV_TSC_OPTIONS, mergeTscOptionsJson } from "../options/tsc";
import { OutModules } from "../options/typescript";
import { Project, ResolvedProject, resolveProject } from "../project";
import { TypescriptConfig } from "../target-tasks/_typescript";
import { getBuildTypescriptTask, getBuildTypescriptWatchTask } from "../target-tasks/build-typescript";
import { getTsconfigJsonTask } from "../target-tasks/tsconfig-json";
import { CleanOptions as _CleanOptions, generateTask as generateCleanTask } from "../task-generators/clean";
import * as copy from "../task-generators/copy";
import { AbsPosixPath, RelPosixPath } from "../types";
import * as matcher from "../utils/matcher";

export type WatchTaskFunction = (TaskFunction & (() => FSWatcher));

/**
 * Generate a copy task (and the corresponding watch task) for the copy operations described by `copyOptions`
 *
 * @param gulp Gulp instance to use for utility methods.
 * @param srcDir Base directory for source resolution.
 * @param targetDir Base directory for target (build) resolution.
 * @param copyOptions Simple copy operations to apply for this copy task.
 * @return A tuple with the task function and corresponding watch task function.
 */
export function getCopy(
  gulp: Gulp,
  srcDir: string,
  targetDir: string,
  copyOptions: Iterable<CopyOptions>,
): [TaskFunction, TaskFunction] {
  const tasks: TaskFunction[] = [];
  const watchTasks: WatchTaskFunction[] = [];
  for (const options of copyOptions) {
    const from: string = options.src === undefined ? srcDir : posixPath.join(srcDir, options.src);
    const files: string[] = options.files === undefined ? ["**/*"] : options.files;
    const to: string = options.dest === undefined ? targetDir : posixPath.join(targetDir, options.dest);

    const completeOptions: copy.Options = {from, files, to};
    tasks.push(copy.generateTask(gulp, completeOptions));
    watchTasks.push(() => copy.watch(gulp, completeOptions));
  }

  const task: TaskFunction = gulp.parallel(tasks);
  const watch: TaskFunction = gulp.parallel(watchTasks);
  return [task, watch];
}

export interface TargetBase {
  project: Project;

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
   * Output modules.
   *
   * - `Js`: Use the compiler options to emit `*.js` files.
   * - `Mjs`: Enforce `es2015` modules and emit `*.mjs` files.
   * - `Both`: Emit both `*.js` files using the compiler options and `*.mjs` using `es2015`.
   *
   * Default: `Js`
   */
  outModules?: OutModules;

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
  readonly project: ResolvedProject;

  readonly srcDir: AbsPosixPath;

  readonly buildDir: AbsPosixPath;

  readonly scripts: Iterable<string>;

  readonly customTypingsDir: AbsPosixPath | null;

  readonly tscOptions: CompilerOptionsJson;

  readonly outModules: OutModules;

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
 * @param target Non-resolved target.
 * @return Resolved target.
 */
export function resolveTargetBase(target: TargetBase): ResolvedTargetBase {
  const project: ResolvedProject = resolveProject(target.project);

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

  const outModules: OutModules = target.outModules !== undefined ? target.outModules : OutModules.Js;

  const tsconfigJson: AbsPosixPath | null = target.tsconfigJson !== undefined ?
    (target.tsconfigJson !== null ? posixPath.join(project.absRoot, target.tsconfigJson) : null) :
    posixPath.join(srcDir, "tsconfig.json");

  const dependencies: ResolvedBaseDependencies = {typescript};
  if (target.dependencies !== undefined) {
    Object.assign(dependencies, target.dependencies);
  }

  return {
    project,
    name: target.name,
    srcDir,
    buildDir,
    scripts,
    customTypingsDir,
    tscOptions,
    outModules,
    tsconfigJson,
    dependencies,
    copy: target.copy,
    clean: target.clean,
  };
}

/**
 * Adds a display name to the supplied task function and returns the task function.
 *
 * @param name The display name to set.
 * @param task The task function to name.
 * @return The input task, with its `displayName` property set to `name`.
 */
export function nameTask<T extends TaskFunction>(name: string, task: T): T & {displayName: string} {
  task.displayName = name;
  return <T & {displayName: string}> task;
}

/**
 * Name a task function and register it to the provided gulp instance.
 */
export function addTask(gulp: Gulp, displayName: string, task: TaskFunction): TaskFunction {
  gulp.task(nameTask(displayName, task));
  return task;
}

/**
 * Creates a Vinyl stream source from a Buffer.
 */
export function gulpBufferSrc(filename: string, data: Buffer): NodeJS.ReadableStream {
  const src: ReadableStream = new ReadableStream({objectMode: true});
  src._read = function () {
    this.push(new Vinyl({
      path: filename,
      contents: data,
    }));
    this.push(null);
  };
  return src;
}

/**
 * Base tasks available for every target.
 */
export interface BaseTasks {
  buildScripts: TaskFunction;
  buildCopy?: TaskFunction;
  build: TaskFunction;
  watch?: TaskFunction;
  clean?: TaskFunction;
  tsconfigJson?: TaskFunction;
}

/**
 * Generates gulp tasks available for every target (base tasks).
 *
 * @param gulp Gulp instance used to generate tasks manipulating files.
 * @param targetOptions Target configuration.
 */
export function generateBaseTasks(gulp: Gulp, targetOptions: TargetBase): BaseTasks {
  const target: ResolvedTargetBase = resolveTargetBase(targetOptions);

  const result: BaseTasks = <any> {};

  // Typescript options
  const tsOptions: TypescriptConfig = {
    tscOptions: target.tscOptions,
    tsconfigJson: target.tsconfigJson,
    customTypingsDir: target.customTypingsDir,
    packageJson: target.project.absPackageJson,
    buildDir: target.buildDir,
    srcDir: target.srcDir,
    scripts: target.scripts,
    outModules: target.outModules,
  };

  const watchTasks: TaskFunction[] = [];

  // build:scripts
  result.buildScripts = nameTask(`${target.name}:build:scripts`, getBuildTypescriptTask(gulp, tsOptions));
  watchTasks.push(nameTask(`${target.name}:watch:scripts`, getBuildTypescriptWatchTask(gulp, tsOptions)));

  // build:copy
  if (target.copy !== undefined) {
    const [copyTask, copyWatchTask]: [TaskFunction, TaskFunction] = getCopy(
      gulp,
      target.srcDir,
      target.buildDir,
      target.copy,
    );
    result.buildCopy = nameTask(`${target.name}:build:copy`, copyTask);
    watchTasks.push(nameTask(`${target.name}:watch:copy`, copyWatchTask));
  }

  // build
  const buildTasks: TaskFunction[] = [result.buildScripts];
  if (result.buildCopy !== undefined) {
    buildTasks.push(result.buildCopy);
  }
  result.build = nameTask(`${target.name}:build`, gulp.parallel(buildTasks));
  result.watch = nameTask(`${target.name}:watch`, gulp.series(result.build, gulp.parallel(watchTasks)));

  // clean
  if (target.clean !== undefined) {
    const cleanOptions: _CleanOptions = {
      base: target.project.absRoot,
      dirs: target.clean.dirs,
      files: target.clean.files,
    };
    result.clean = nameTask(`${target.name}:clean`, generateCleanTask(gulp, cleanOptions));
  }

  // tsconfig.json
  if (target.tsconfigJson !== null) {
    result.tsconfigJson = nameTask(`${target.name}:tsconfig.json`, getTsconfigJsonTask(tsOptions));
  }

  return result;
}

/**
 * Generates and registers gulp tasks available for every target (base tasks).
 *
 * @param gulp Gulp instance where the tasks will be registered.
 * @param targetOptions Target configuration.
 */
export function registerBaseTasks(gulp: Gulp, targetOptions: TargetBase): BaseTasks {
  const tasks: BaseTasks = generateBaseTasks(gulp, targetOptions);
  for (const key in tasks) {
    const task: TaskFunction | undefined = (<any> tasks)[key];
    if (task !== undefined) {
      gulp.task(task);
    }
  }
  return tasks;
}
