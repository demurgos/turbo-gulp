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
import {getTypedocTask} from "../target-tasks/typedoc";
import * as clean from "../task-generators/clean";
import {AbsPosixPath, RelPosixPath} from "../types";
import {branchPublish} from "../utils/branch-publish";
import {getHeadHash} from "../utils/git";
import * as matcher from "../utils/matcher";
import {npmPublish} from "../utils/npm-publish";
import {PackageJson, readJsonFile} from "../utils/project";

function gulpBufferSrc(filename: string, data: Buffer): NodeJS.ReadableStream {
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

/**
 * Represents a Typescript library.
 * This is compatible with both browsers and Node.
 */
export interface LibTarget {
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
   * Relative path for the main module (entry point of the lib) WITHOUT EXTENSION, relative to `project.srcDir`.
   * Default: `"index"`.
   */
  mainModule: RelPosixPath;

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
   * Path to the `typedoc` directory, relative to `project.rootDir`.
   * Use `null` to not generate a `typedoc` task.
   * Default: `join(project.rootDir, "typedoc")`.
   */
  typedoc?: TypedocOptions;

  /**
   * Override default dependencies or provide optional dependencies.
   */
  dependencies?: LibDependencies;

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

  /**
   * Options for distribution builds.
   * `false`: No distribution build
   * `true`: Distribution build with defaults
   * `DistOptions`: Provide custom options
   * Default: `false`, no distribution build.
   */
  dist?: true | false | DistOptions;
}

/**
 * Library with fully resolved paths and dependencies.
 */
interface ResolvedLibTarget extends LibTarget {
  readonly srcDir: AbsPosixPath;

  readonly buildDir: AbsPosixPath;

  readonly scripts: Iterable<string>;

  readonly customTypingsDir: AbsPosixPath | null;

  readonly tscOptions: CompilerOptionsJson;

  readonly tsconfigJson: AbsPosixPath | null;

  readonly typedoc?: ResolvedTypedocOptions;

  readonly dependencies: ResolvedLibDependencies;

  readonly copy?: CopyOptions[];

  readonly clean?: CleanOptions;

  readonly dist: false | ResolvedDistOptions;
}

export interface LibDependencies {
  readonly typescript?: typeof typescript;
}

/**
 * Fully resolved dependencies, either using defaults or the library provided by the user.
 */
interface ResolvedLibDependencies extends LibDependencies {
  readonly typescript: typeof typescript;
}

export interface DistOptions {
  /**
   * Directory used for distribution builds.
   */
  readonly distDir?: RelPosixPath;

  readonly npmPublish?: NpmPublishOptions;

  /**
   * Optional function to apply when copying the `package.json` file to the dist directory.
   */
  packageJsonMap?(old: PackageJson): PackageJson;
}

export interface ResolvedDistOptions extends DistOptions {
  /**
   * Directory used for distribution builds.
   */
  readonly distDir: RelPosixPath;

  /**
   * Optional function to apply when copying the `package.json` file to the dist directory.
   */
  packageJsonMap(old: PackageJson): PackageJson;
}

export interface TypedocOptions {
  /**
   * Path to the `typedoc` directory, relative to `project.rootDir`.
   * Use `null` to not generate a `typedoc` task.
   * Default: `join(project.rootDir, "typedoc")`.
   */
  readonly dir: RelPosixPath;

  readonly name: string;

  readonly deploy: GitDeployOptions;
}

export interface ResolvedTypedocOptions extends TypedocOptions {
  readonly dir: AbsPosixPath;
}

export interface NpmPublishOptions {
  /**
   * Tag to use for this publication.
   *
   * Default: `"latest"`.
   */
  readonly tag?: string;

  /**
   * Path to the npm command-line program.
   *
   * Default: `"npm"` (assumes that `npm` is in the `$PATH`)
   */
  readonly command?: string;

  /**
   * URI of the registry to use.
   *
   * Default: `"registry.npmjs.org/"`
   */
  readonly registry?: string;

  readonly authToken?: string;
}

export interface GitDeployOptions {
  readonly repository: string;
  readonly branch: string;
  readonly commitAuthor?: string;
}

/**
 * Resolve absolute paths and dependencies for the provided target.
 *
 * @param project Project to use.
 * @param target Non-resolved target.
 * @return Resolved target.
 */
function resolveLibTarget(project: ResolvedProject, target: LibTarget): ResolvedLibTarget {
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

  let typedoc: ResolvedTypedocOptions | undefined = undefined;
  if (target.typedoc !== undefined) {
    typedoc = {
      dir: posixPath.join(project.absRoot, target.typedoc.dir),
      name: target.typedoc.name,
      deploy: target.typedoc.deploy,
    };
  }

  const defaultDependencies: ResolvedLibDependencies = {
    typescript: typescript,
  };

  let dependencies: ResolvedLibDependencies;
  if (target.dependencies !== undefined) {
    dependencies = {...defaultDependencies, ...target.dependencies};
  } else {
    dependencies = defaultDependencies;
  }

  let dist: ResolvedDistOptions | false;
  if (target.dist === undefined || target.dist === false) {
    dist = false;
  } else {
    const defaultDistDir: AbsPosixPath = posixPath.join(project.absDistDir, target.name);
    const defaultPackageJsonMap: (pkg: PackageJson) => PackageJson = (pkg) => pkg;

    if (target.dist === true) { // `true` literal
      dist = {
        distDir: defaultDistDir,
        packageJsonMap: defaultPackageJsonMap,
        npmPublish: {},
      };
    } else {
      dist = {
        distDir: target.dist.distDir !== undefined ? target.dist.distDir : defaultDistDir,
        packageJsonMap: target.dist.packageJsonMap !== undefined ? target.dist.packageJsonMap : defaultPackageJsonMap,
        npmPublish: target.dist.npmPublish,
      };
    }
  }

  return {
    name: target.name,
    srcDir,
    buildDir,
    scripts,
    mainModule: target.mainModule,
    customTypingsDir,
    tscOptions,
    tsconfigJson,
    typedoc,
    dependencies,
    copy: target.copy,
    clean: target.clean,
    dist,
  };
}

function addTask(gulp: Gulp, displayName: string, task: TaskFunction): TaskFunction {
  task.displayName = displayName;
  gulp.task(task);
  return task;
}

/**
 * Generates and registers gulp tasks for the provided lib target.
 *
 * @param gulp Gulp instance where the tasks will be registered.
 * @param project Project configuration.
 * @param target Target configuration.
 */
export function registerLibTargetTasks(gulp: Gulp, project: Project, target: LibTarget): void {
  const resolvedProject: ResolvedProject = resolveProject(project);
  const resolvedTarget: ResolvedLibTarget = resolveLibTarget(resolvedProject, target);

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
  buildTasks.push(addTask(gulp, `${target.name}:build:scripts`, getBuildTypescriptTask(gulp, tsOptions)));

  // build:copy
  if (resolvedTarget.copy !== undefined) {
    const [copyTask, copyWatchers]: [TaskFunction, ManyWatchFunction] = generateCopyTasks(
      gulp,
      resolvedTarget.srcDir,
      resolvedTarget.buildDir,
      resolvedTarget.copy,
    );
    buildTasks.push(addTask(gulp, `${target.name}:build:copy`, copyTask));
  }

  // build
  addTask(gulp, `${target.name}:build`, gulp.parallel(buildTasks));

  // clean
  if (resolvedTarget.clean !== undefined) {
    const cleanOptions: clean.Options = {
      base: resolvedProject.absRoot,
      dirs: resolvedTarget.clean.dirs,
      files: resolvedTarget.clean.files,
    };
    addTask(gulp, `${target.name}:clean`, clean.generateTask(gulp, cleanOptions));
  }

  // tsconfig.json
  if (resolvedTarget.tsconfigJson !== null) {
    addTask(gulp, `${target.name}:tsconfig.json`, getTsconfigJsonTask(tsOptions));
  }

  // typedoc
  if (resolvedTarget.typedoc !== undefined) {
    const typedocOptions: TypedocOptions = resolvedTarget.typedoc;
    const typedocTask: TaskFunction = addTask(
      gulp,
      `${target.name}:typedoc`,
      getTypedocTask(gulp, tsOptions, typedocOptions),
    );

    // typedoc:deploy
    if (typedocOptions.deploy !== undefined) {
      async function deployTypedocTask(): Promise<void> {
        const commitMessage: string = `Deploy documentation for ${await getHeadHash()}`;
        return branchPublish({...typedocOptions.deploy, dir: typedocOptions.dir, commitMessage});
      }

      addTask(gulp, `${target.name}:typedoc:deploy`, gulp.series(typedocTask, deployTypedocTask));
    }
  }

  // dist
  if (resolvedTarget.dist !== false) {
    const dist: ResolvedDistOptions = resolvedTarget.dist;
    const distTasks: TaskFunction[] = [];
    const distScriptsTasks: TaskFunction[] = [];

    // dist:copy-src
    distScriptsTasks.push(addTask(
      gulp,
      `${target.name}:dist:copy-src`,
      (): NodeJS.ReadableStream => {
        return gulp
          .src([...resolvedTarget.scripts], {base: resolvedTarget.srcDir})
          .pipe(gulp.dest(dist.distDir));
      },
    ));

    let distCustomTypingsDir: AbsPosixPath | null = null;

    // dist:copy-custom-typings
    if (resolvedTarget.customTypingsDir !== null) {
      const customTypingsDir: RelPosixPath = resolvedTarget.customTypingsDir;
      distCustomTypingsDir = posixPath.join(dist.distDir, "_custom-typings");
      distScriptsTasks.push(addTask(
        gulp,
        `${target.name}:dist:copy-custom-typings`,
        (): NodeJS.ReadableStream => {
          return gulp
            .src([posixPath.join(customTypingsDir, "**/*.d.ts")], {base: customTypingsDir})
            .pipe(gulp.dest(distCustomTypingsDir!));
        },
      ));
    }

    // dist:copy
    if (resolvedTarget.copy !== undefined) {
      const [copyTask, copyWatchers]: [TaskFunction, ManyWatchFunction] = generateCopyTasks(
        gulp,
        resolvedTarget.srcDir,
        resolvedTarget.dist.distDir,
        resolvedTarget.copy,
      );
      distTasks.push(addTask(gulp, `${target.name}:dist:copy`, copyTask));
    }

    // Resolve tsconfig for `dist`
    const tsconfigJson: AbsPosixPath | null = resolvedTarget.tsconfigJson !== null ?
      posixPath.join(dist.distDir, "tsconfig.json") :
      null;
    const packageJson: AbsPosixPath = posixPath.join(dist.distDir, "package.json");
    const scripts: string[] = [];
    for (const script of resolvedTarget.scripts) {
      scripts.push(
        matcher.asString(matcher.join(dist.distDir, matcher.relative(resolvedTarget.srcDir, new Minimatch(script)))),
      );
    }

    const tsOptions: TypescriptConfig = {
      tscOptions: resolvedTarget.tscOptions,
      tsconfigJson,
      customTypingsDir: distCustomTypingsDir,
      packageJson: resolvedProject.absPackageJson,
      buildDir: dist.distDir,
      srcDir: dist.distDir,
      scripts,
    };

    // dist:scripts
    distTasks.push(addTask(
      gulp,
      `${target.name}:dist:scripts`,
      gulp.series(gulp.parallel(distScriptsTasks), getBuildTypescriptTask(gulp, tsOptions)),
    ));

    // // dist:tsconfig.json
    // if (resolvedTarget.tsconfigJson !== null) {
    //   distTasks.push(addTask(
    //     gulp,
    //     `${target.name}:dist:tsconfig.json`,
    //     getTsconfigJsonTask({...tsOptions, packageJson})
    //   ));
    // }

    // dist:package.json
    {
      async function distPackageJsonTask(): Promise<NodeJS.ReadableStream> {
        let pkg: PackageJson = await readJsonFile(resolvedProject.absPackageJson);
        if (typeof resolvedTarget.mainModule === "string") {
          pkg.main = `${resolvedTarget.mainModule}.js`;
          pkg.types = `${resolvedTarget.mainModule}.d.ts`;
        }
        pkg.gitHead = await getHeadHash();
        pkg = dist.packageJsonMap(pkg);

        return gulpBufferSrc("package.json", Buffer.from(JSON.stringify(pkg, null, 2)))
          .pipe(gulp.dest(dist.distDir));
      }

      distTasks.push(addTask(gulp, `${target.name}:dist:package.json`, distPackageJsonTask));
    }

    addTask(gulp, `${target.name}:dist`, gulp.parallel(distTasks));

    if (dist.npmPublish !== undefined) {
      const npmPublishOptions: NpmPublishOptions = dist.npmPublish;
      const npmPublishTask: TaskFunction = async (): Promise<void> => {
        return npmPublish({
          ...npmPublishOptions,
          directory: dist.distDir,
        });
      };
      npmPublishTask.displayName = `${target.name}:dist:publish`;
      gulp.task(npmPublishTask);
    }
  }
}
