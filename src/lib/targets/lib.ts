import { Gulp, TaskFunction } from "gulp";
import { Minimatch } from "minimatch";
import { posix as posixPath } from "path";
import { CleanOptions } from "../options/clean";
import { CopyOptions } from "../options/copy";
import { CompilerOptionsJson } from "../options/tsc";
import { ResolvedProject } from "../project";
import { generateCopyTasks, ManyWatchFunction } from "../target-generators/base";
import { TypescriptConfig } from "../target-tasks/_typescript";
import { getBuildTypescriptTask } from "../target-tasks/build-typescript";
import { getTypedocTask } from "../target-tasks/typedoc";
import { AbsPosixPath, RelPosixPath } from "../types";
import { branchPublish } from "../utils/branch-publish";
import { getHeadHash } from "../utils/git";
import * as matcher from "../utils/matcher";
import { npmPublish } from "../utils/npm-publish";
import { PackageJson, readJsonFile } from "../utils/project";
import {
  BaseTasks,
  generateBaseTasks,
  gulpBufferSrc,
  nameTask,
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
  readonly project: ResolvedProject;

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

  /**
   * Copy the sources from `target.srcDir` to `target.dist.distDir`. Default: `true`.
   */
  readonly copySrc?: boolean;

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
  readonly distDir: AbsPosixPath;

  /**
   * Copy the sources from `target.srcDir` to `target.dist.distDir`, and custom typings to `_custom-typings`.
   */
  readonly copySrc: boolean;

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

  readonly deploy?: GitDeployOptions;
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
 * @param target Non-resolved target.
 * @return Resolved target.
 */
function resolveLibTarget(target: LibTarget): ResolvedLibTarget {
  const base: ResolvedTargetBase = resolveTargetBase(target);

  let typedoc: ResolvedTypedocOptions | undefined = undefined;
  if (target.typedoc !== undefined) {
    typedoc = {
      dir: posixPath.join(base.project.absRoot, target.typedoc.dir),
      name: target.typedoc.name,
      deploy: target.typedoc.deploy,
    };
  }

  let dist: ResolvedDistOptions | false;
  if (target.dist === undefined || target.dist === false) {
    dist = false;
  } else {
    const defaultDistDir: AbsPosixPath = posixPath.join(base.project.absDistDir, target.name);
    const defaultPackageJsonMap: (pkg: PackageJson) => PackageJson = pkg => pkg;

    if (target.dist === true) { // `true` literal
      dist = {
        distDir: defaultDistDir,
        packageJsonMap: defaultPackageJsonMap,
        npmPublish: {},
        copySrc: true,
      };
    } else {
      dist = {
        distDir: target.dist.distDir !== undefined ? target.dist.distDir : defaultDistDir,
        packageJsonMap: target.dist.packageJsonMap !== undefined ? target.dist.packageJsonMap : defaultPackageJsonMap,
        npmPublish: target.dist.npmPublish,
        copySrc: target.dist.copySrc !== undefined ? target.dist.copySrc : true,
      };
    }
  }

  return {...base, mainModule: target.mainModule, typedoc, dist};
}

export interface LibTasks extends BaseTasks {
  typedoc?: TaskFunction;
  typedocDeploy?: TaskFunction;
  dist?: TaskFunction;
  distCopySrc?: TaskFunction;
  distCopySrcScripts?: TaskFunction;
  distCopySrcCustomTypings?: TaskFunction;
  distPublish?: TaskFunction;
  distPackageJson?: TaskFunction;
}

/**
 * Generates gulp tasks for the provided lib target.
 *
 * @param gulp Gulp instance used to generate tasks manipulating files.
 * @param targetOptions Target configuration.
 */
export function generateLibTasks(gulp: Gulp, targetOptions: LibTarget): LibTasks {
  const target: ResolvedLibTarget = resolveLibTarget(targetOptions);
  const result: LibTasks = <LibTasks> generateBaseTasks(gulp, targetOptions);

  const tsOptions: TypescriptConfig = {
    tscOptions: target.tscOptions,
    tsconfigJson: target.tsconfigJson,
    customTypingsDir: target.customTypingsDir,
    packageJson: target.project.absPackageJson,
    buildDir: target.buildDir,
    srcDir: target.srcDir,
    scripts: target.scripts,
  };

  // typedoc
  if (target.typedoc !== undefined) {
    const typedocOptions: TypedocOptions = target.typedoc;
    result.typedoc = nameTask(`${target.name}:typedoc`, getTypedocTask(gulp, tsOptions, typedocOptions));

    // typedoc:deploy
    if (typedocOptions.deploy !== undefined) {
      const deploy: GitDeployOptions = typedocOptions.deploy;

      async function deployTypedocTask(): Promise<void> {
        const commitMessage: string = `Deploy documentation for ${await getHeadHash()}`;
        return branchPublish({...deploy, dir: typedocOptions.dir, commitMessage});
      }

      result.typedocDeploy = nameTask(`${target.name}:typedoc:deploy`, gulp.series(result.typedoc!, deployTypedocTask));
    }
  }

  // dist
  if (target.dist !== false) {
    const dist: ResolvedDistOptions = target.dist;
    const distTasks: TaskFunction[] = [];

    let srcDir: AbsPosixPath = target.srcDir;
    let customTypingsDir: AbsPosixPath | null = target.customTypingsDir;
    if (target.dist.copySrc) {
      srcDir = dist.distDir;
      result.distCopySrcScripts = nameTask(
        `${target.name}:dist:copy-src:scripts`,
        (): NodeJS.ReadableStream => {
          return gulp
            .src([...target.scripts], {base: target.srcDir})
            .pipe(gulp.dest(dist.distDir));
        },
      );
      // dist:copy-custom-typings
      if (target.customTypingsDir !== null) {
        const srcCustomTypingsDir: AbsPosixPath = target.customTypingsDir;
        customTypingsDir = posixPath.join(dist.distDir, "_custom-typings");
        result.distCopySrcCustomTypings = nameTask(
          `${target.name}:dist:copy-src:custom-typings`,
          (): NodeJS.ReadableStream => {
            return gulp
              .src([posixPath.join(srcCustomTypingsDir, "**/*.d.ts")], {base: srcCustomTypingsDir})
              .pipe(gulp.dest(customTypingsDir!));
          },
        );
      }

      const copySrcTasks: TaskFunction[] = [result.distCopySrcScripts];
      if (result.distCopySrcCustomTypings !== undefined) {
        copySrcTasks.push(result.distCopySrcCustomTypings);
      }
      result.distCopySrc = nameTask(`${target.name}:dist:copy-src`, gulp.parallel(copySrcTasks));
    }

    // dist:copy
    if (target.copy !== undefined) {
      const [copyTask, copyWatchers]: [TaskFunction, ManyWatchFunction] = generateCopyTasks(
        gulp,
        target.srcDir,
        target.dist.distDir,
        target.copy,
      );
      distTasks.push(nameTask(`${target.name}:dist:copy`, copyTask));
    }

    // Resolve tsconfig for `dist`
    const tsconfigJson: AbsPosixPath | null = target.tsconfigJson !== null ?
      posixPath.join(dist.distDir, "tsconfig.json") :
      null;
    const packageJson: AbsPosixPath = posixPath.join(dist.distDir, "package.json");
    let scripts: string[] = [];
    if (srcDir !== target.srcDir) {
      for (const script of target.scripts) {
        scripts.push(
          matcher.asString(matcher.join(srcDir, matcher.relative(target.srcDir, new Minimatch(script)))),
        );
      }
    } else {
      scripts = [...target.scripts];
    }

    const tsOptions: TypescriptConfig = {
      tscOptions: target.tscOptions,
      tsconfigJson,
      customTypingsDir,
      packageJson: target.project.absPackageJson,
      buildDir: dist.distDir,
      srcDir,
      scripts,
    };

    // dist:scripts
    if (result.distCopySrc !== undefined) {
      distTasks.push(nameTask(
        `${target.name}:dist:scripts`,
        gulp.series(result.distCopySrc, getBuildTypescriptTask(gulp, tsOptions)),
      ));
    } else {
      distTasks.push(nameTask(`${target.name}:dist:scripts`, getBuildTypescriptTask(gulp, tsOptions)));
    }

    // // dist:tsconfig.json
    // if (target.tsconfigJson !== null) {
    //   distTasks.push(nameTask(
    //     gulp,
    //     `${target.name}:dist:tsconfig.json`,
    //     getTsconfigJsonTask({...tsOptions, packageJson})
    //   ));
    // }

    // dist:package.json
    {
      async function distPackageJsonTask(): Promise<NodeJS.ReadableStream> {
        let pkg: PackageJson = await readJsonFile(target.project.absPackageJson);
        if (typeof target.mainModule === "string") {
          pkg.main = `${target.mainModule}.js`;
          pkg.types = `${target.mainModule}.d.ts`;
        }
        pkg.gitHead = await getHeadHash();
        pkg = dist.packageJsonMap(pkg);

        return gulpBufferSrc("package.json", Buffer.from(JSON.stringify(pkg, null, 2)))
          .pipe(gulp.dest(dist.distDir));
      }

      result.distPackageJson = nameTask(`${target.name}:dist:package.json`, distPackageJsonTask);
      distTasks.push(result.distPackageJson);
    }

    const distTask: TaskFunction = result.clean !== undefined ?
      gulp.series(result.clean, gulp.parallel(distTasks)) :
      gulp.parallel(distTasks);
    result.dist = nameTask(`${target.name}:dist`, distTask);

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
      result.distPublish = nameTask(`${target.name}:dist:publish`, gulp.series(distTask, npmPublishTask));
    }
  }

  return result;
}

/**
 * Generates and registers gulp tasks for the provided lib target.
 *
 * @param gulp Gulp instance where the tasks will be registered.
 * @param targetOptions Target configuration.
 */
export function registerLibTasks(gulp: Gulp, targetOptions: LibTarget): LibTasks {
  const tasks: LibTasks = generateLibTasks(gulp, targetOptions);
  for (const key in tasks) {
    const task: TaskFunction | undefined = (<any> tasks)[key];
    if (task !== undefined) {
      gulp.task(task);
    }
  }
  return tasks;
}
