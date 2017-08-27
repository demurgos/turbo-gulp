import {Gulp, TaskFunction} from "gulp";
import {Minimatch} from "minimatch";
import {posix as posixPath} from "path";
import {CleanOptions} from "../options/clean";
import {CopyOptions} from "../options/copy";
import {CompilerOptionsJson} from "../options/tsc";
import {Project, ResolvedProject, resolveProject} from "../project";
import {generateCopyTasks, ManyWatchFunction} from "../target-generators/base";
import {TypescriptConfig} from "../target-tasks/_typescript";
import {getBuildTypescriptTask} from "../target-tasks/build-typescript";
import {getTypedocTask} from "../target-tasks/typedoc";
import {AbsPosixPath, RelPosixPath} from "../types";
import {branchPublish} from "../utils/branch-publish";
import {getHeadHash} from "../utils/git";
import * as matcher from "../utils/matcher";
import {npmPublish} from "../utils/npm-publish";
import {PackageJson, readJsonFile} from "../utils/project";
import {
  addTask,
  BaseTasks, gulpBufferSrc,
  registerBaseTasks,
  ResolvedBaseDependencies,
  ResolvedTargetBase,
  resolveTargetBase,
  TargetBase,
} from "./_base";

/**
 * Represents a Typescript library.
 * This is compatible with both browsers and Node.
 */
export interface LibTarget extends TargetBase {
  /**
   * Relative path for the main module (entry point of the lib) WITHOUT EXTENSION, relative to `project.srcDir`.
   * Default: `"index"`.
   */
  mainModule: RelPosixPath;

  /**
   * Path to the `typedoc` directory, relative to `project.rootDir`.
   * Use `null` to not generate a `typedoc` task.
   * Default: `join(project.rootDir, "typedoc")`.
   */
  typedoc?: TypedocOptions;

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
interface ResolvedLibTarget extends LibTarget, ResolvedTargetBase {
  readonly srcDir: AbsPosixPath;

  readonly buildDir: AbsPosixPath;

  readonly scripts: Iterable<string>;

  readonly customTypingsDir: AbsPosixPath | null;

  readonly tscOptions: CompilerOptionsJson;

  readonly tsconfigJson: AbsPosixPath | null;

  readonly typedoc?: ResolvedTypedocOptions;

  readonly dependencies: ResolvedBaseDependencies;

  readonly copy?: CopyOptions[];

  readonly clean?: CleanOptions;

  readonly dist: false | ResolvedDistOptions;
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
  const base: ResolvedTargetBase = resolveTargetBase(project, target);

  let typedoc: ResolvedTypedocOptions | undefined = undefined;
  if (target.typedoc !== undefined) {
    typedoc = {
      dir: posixPath.join(project.absRoot, target.typedoc.dir),
      name: target.typedoc.name,
      deploy: target.typedoc.deploy,
    };
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

  return {...base, mainModule: target.mainModule, typedoc, dist};
}

export interface LibTasks extends BaseTasks {
  typedoc?: TaskFunction;
  typedocDeploy?: TaskFunction;
}

/**
 * Generates and registers gulp tasks for the provided lib target.
 *
 * @param gulp Gulp instance where the tasks will be registered.
 * @param project Project configuration.
 * @param target Target configuration.
 */
export function registerLibTargetTasks(gulp: Gulp, project: Project, target: LibTarget): LibTasks {
  const resolvedProject: ResolvedProject = resolveProject(project);
  const resolvedTarget: ResolvedLibTarget = resolveLibTarget(resolvedProject, target);
  const result: LibTasks = <LibTasks> registerBaseTasks(gulp, project, target);

  const tsOptions: TypescriptConfig = {
    tscOptions: resolvedTarget.tscOptions,
    tsconfigJson: resolvedTarget.tsconfigJson,
    customTypingsDir: resolvedTarget.customTypingsDir,
    packageJson: resolvedProject.absPackageJson,
    buildDir: resolvedTarget.buildDir,
    srcDir: resolvedTarget.srcDir,
    scripts: resolvedTarget.scripts,
  };

  // typedoc
  if (resolvedTarget.typedoc !== undefined) {
    const typedocOptions: TypedocOptions = resolvedTarget.typedoc;
    result.typedoc = addTask(gulp, `${target.name}:typedoc`, getTypedocTask(gulp, tsOptions, typedocOptions));

    // typedoc:deploy
    if (typedocOptions.deploy !== undefined) {
      async function deployTypedocTask(): Promise<void> {
        const commitMessage: string = `Deploy documentation for ${await getHeadHash()}`;
        return branchPublish({...typedocOptions.deploy, dir: typedocOptions.dir, commitMessage});
      }

      result.typedocDeploy = addTask(
        gulp,
        `${target.name}:typedoc:deploy`,
        gulp.series(result.typedoc, deployTypedocTask),
      );
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

    const distTask: TaskFunction = result.clean !== undefined ?
      gulp.series(result.clean, gulp.parallel(distTasks)) :
      gulp.parallel(distTasks);
    addTask(gulp, `${target.name}:dist`, distTask);

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
      addTask(gulp, `${target.name}:dist:publish`, gulp.series(distTask, npmPublishTask));
    }
  }

  return result;
}
