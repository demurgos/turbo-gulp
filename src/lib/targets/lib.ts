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
import {TypescriptConfig} from "../target-tasks/_typescript";
import {getBuildTypescriptTask} from "../target-tasks/build-typescript";
import {getTsconfigJsonTask} from "../target-tasks/tsconfig-json";
import {getTypedocTask} from "../target-tasks/typedoc";
import {AbsPosixPath, RelPosixPath} from "../types";
import {branchPublish} from "../utils/branch-publish";
import {getHeadHash} from "../utils/git";
import * as matcher from "../utils/matcher";
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
  srcDir: AbsPosixPath;

  buildDir: AbsPosixPath;

  scripts: Iterable<string>;

  customTypingsDir: AbsPosixPath | null;

  tscOptions: CompilerOptionsJson;

  tsconfigJson: AbsPosixPath | null;

  typedoc?: ResolvedTypedocOptions;

  dependencies: ResolvedLibDependencies;

  copy?: CopyOptions[];

  clean?: CleanOptions;

  dist: false | ResolvedDistOptions;
}

export interface LibDependencies {
  typescript?: typeof typescript;
}

/**
 * Fully resolved dependencies, either using defaults or the library provided by the user.
 */
interface ResolvedLibDependencies extends LibDependencies {
  typescript: typeof typescript;
}

export interface DistOptions {
  /**
   * Directory used for distribution builds.
   */
  distDir?: RelPosixPath;

  /**
   * Optional function to apply when copying the `package.json` file to the dist directory.
   */
  packageJsonMap?(old: PackageJson): PackageJson;
}

export interface ResolvedDistOptions extends DistOptions {
  /**
   * Directory used for distribution builds.
   */
  distDir: RelPosixPath;

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
  dir: RelPosixPath;

  name: string;

  deploy: GitDeployOptions;
}

export interface ResolvedTypedocOptions extends TypedocOptions {
  dir: AbsPosixPath;
}

export interface GitDeployOptions {
  repository: string;
  branch: string;
  commitAuthor?: string;
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
      };
    } else {
      dist = {
        distDir: target.dist.distDir !== undefined ? target.dist.distDir : defaultDistDir,
        packageJsonMap: target.dist.packageJsonMap !== undefined ? target.dist.packageJsonMap : defaultPackageJsonMap,
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

  // build:scripts
  const buildTypescriptTask: TaskFunction = getBuildTypescriptTask(gulp, tsOptions);
  buildTypescriptTask.displayName = `${target.name}:build:scripts`;
  gulp.task(buildTypescriptTask);

  // tsconfig.json
  if (resolvedTarget.tsconfigJson !== null) {
    const tsconfigJsonTask: TaskFunction = getTsconfigJsonTask(tsOptions);
    tsconfigJsonTask.displayName = `${target.name}:tsconfig.json`;
    gulp.task(tsconfigJsonTask);
  }

  const publishTasks: TaskFunction[] = [];

  // typedoc
  if (resolvedTarget.typedoc !== undefined) {
    const typedocOptions: TypedocOptions = resolvedTarget.typedoc;
    const distTypedocTask: TaskFunction = getTypedocTask(gulp, tsOptions, {
      typedocDir: typedocOptions.dir,
      name: typedocOptions.name,
    });
    distTypedocTask.displayName = `${target.name}:typedoc`;
    gulp.task(distTypedocTask);

    // typedoc:deploy
    if (typedocOptions.deploy !== undefined) {
      const deployTypedoc: GitDeployOptions = typedocOptions.deploy;
      const deployTypedocTask: TaskFunction = async (): Promise<void> => {
        const gitHash: string = await getHeadHash();
        return branchPublish({
          directory: typedocOptions.dir,
          repositorySsh: deployTypedoc.repository,
          branch: deployTypedoc.branch,
          commitMessage: `Deploy documentation for ${gitHash}`,
          commitAuthor: deployTypedoc.commitAuthor,
        });
      };
      deployTypedocTask.displayName = `${target.name}:typedoc:deploy`;
      gulp.task(deployTypedocTask);
      publishTasks.push(deployTypedocTask);
    }
  }

  if (resolvedTarget.dist !== false) {
    const dist: ResolvedDistOptions = resolvedTarget.dist;
    const distTasks: TaskFunction[] = [];

    {
      // dist:copy-src
      const copySrcTask: TaskFunction = (): NodeJS.ReadableStream => {
        return gulp
          .src([...resolvedTarget.scripts], {base: resolvedTarget.srcDir})
          .pipe(gulp.dest(dist.distDir));
      };
      copySrcTask.displayName = `${target.name}:dist:copy-src`;
      gulp.task(copySrcTask);
      distTasks.push(copySrcTask);
    }

    let distCustomTypingsDir: AbsPosixPath | null = null;

    // dist:copy-custom-typings
    if (resolvedTarget.customTypingsDir !== null) {
      const customTypingsDir: RelPosixPath = resolvedTarget.customTypingsDir;
      distCustomTypingsDir = posixPath.join(dist.distDir, "_custom-typings");

      const copyCustomTypingsTask: TaskFunction = (): NodeJS.ReadableStream => {
        return gulp
          .src([posixPath.join(customTypingsDir, "**/*.d.ts")], {base: customTypingsDir})
          .pipe(gulp.dest(distCustomTypingsDir!));
      };
      copyCustomTypingsTask.displayName = `${target.name}:dist:copy-custom-typings`;
      gulp.task(copyCustomTypingsTask);
      distTasks.push(copyCustomTypingsTask);
    }

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
      packageJson,
      buildDir: dist.distDir,
      srcDir: dist.distDir,
      scripts,
    };

    // dist:scripts
    const distBuildTypescriptTask: TaskFunction = getBuildTypescriptTask(gulp, tsOptions);
    distBuildTypescriptTask.displayName = `${target.name}:dist:scripts`;
    gulp.task(distBuildTypescriptTask);
    distTasks.push(distBuildTypescriptTask);

    // dist:tsconfig.json
    if (resolvedTarget.tsconfigJson !== null) {
      const distTsconfigJsonTask: TaskFunction = getTsconfigJsonTask(tsOptions);
      distTsconfigJsonTask.displayName = `${target.name}:dist:tsconfig.json`;
      gulp.task(distTsconfigJsonTask);
      distTasks.push(distBuildTypescriptTask);
    }

    {
      // dist:package.json
      const copySrcTask: TaskFunction = async (): Promise<NodeJS.ReadableStream> => {
        let pkg: PackageJson = await readJsonFile(resolvedProject.absPackageJson);
        if (typeof target.mainModule === "string") {
          pkg.main = `${target.mainModule}.js`;
          pkg.types = `${target.mainModule}.d.ts`;
        }
        pkg = dist.packageJsonMap(pkg);

        return gulpBufferSrc("package.json", Buffer.from(JSON.stringify(pkg, null, 2)))
          .pipe(gulp.dest(dist.distDir));
      };
      copySrcTask.displayName = `${target.name}:dist:package.json`;
      gulp.task(copySrcTask);
      distTasks.push(copySrcTask);
    }

    const distTask: TaskFunction = gulp.series(...distTasks);
    distTask.displayName = `${target.name}:dist`;
    gulp.task(distTask);
  }
}
