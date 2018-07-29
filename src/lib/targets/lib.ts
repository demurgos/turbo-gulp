/**
 * This module defines the _lib_ target type used to create libraries for other projects.
 *
 * In the following list of tasks, `{target}` represents the name of the target as defined by the `name` property
 * of the target options.
 * The _lib_ target provides the following tasks:
 *
 * ## {target}:build
 *
 * Performs a full build of the library to the build directory, used for development.
 * This copies the static assets and compiles the scripts.
 *
 * The following sub-tasks are available:
 * - `{target}:build:copy`: Only copy the static assets
 * - `{target}:build:script`: Only compile the scripts
 *
 * For distribution builds, use `{target:dist}`
 *
 * ## {target}:watch
 *
 * Watch the files and run incremental builds on change.
 * This useful during development to get build errors reported immediately or accelerate the code/test cycle.
 * You can combine it with _Nodemon_ to continuously restart your Node process when changing the source.
 *
 * ## {target}:dist
 *
 * Performs a full build of the library to the dist directory, used for distribution (ie. publication to _npm_).
 * This build creates a fully autonomous directory with its own `package.json`, source code, license file, etc.
 * This allows to use a different structure for distribution rather than structure of the repo, the main benefit is
 * to provide support for deep package imports (`import * as mod from "my-lib/deep/module"`) by placing the build
 * at the root of the package.
 * This build also allows you to remap the `package.json`, for example to set the version dynamically.
 *
 * The following sub-tasks are available:
 * - `{target}:dist:publish`: Publish the package to an _npm_ registry (it honors the `registry` option, to publish
 *   to private _npm_ registries such as _Verdaccio_). It uses the authentication token of the current user, this
 *   token is in `~/.npmrc`. For CI, you can use the following command to set the token the registry `npm.example.com`.
 *   (for the official registry, use `//registry.npmjs.org`):
 *   ```
 *   echo "//npm.example.com/:_authToken=\"${NPM_TOKEN}\"" > ~/.npmrc
 *   ```
 * - `{target}:dist:copy-src`: Only copy the source files to the build directory.
 * - `{target}:dist:package.json`: Copy (and eventually transform) the root `package.json` to the build directory.
 *
 * For development builds, use `{target:build}`.
 *
 * ## {target}:typedoc
 *
 * Generate _Typedoc_ documentation.
 *
 * ## {target}:typedoc:deploy
 *
 * Deploy the _Typedoc_ documentation using _git_. This can be used to easily deploy the documentation to the
 * `gh-pages` branch.
 *
 * ## {target}:clean
 *
 * Remove both the build and dist directories corresponding to this target.
 *
 * ## {target}:tsconfig.json
 *
 * Emit a `tsconfig.json` file corresponding to the configuration for this target. This allows to compile it using
 * the command line `tsc` program. This is also useful for IDE to auto-detect the configuration of the project.
 *
 * @module targets/lib
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Minimatch } from "minimatch";
import path from "path";
import Undertaker from "undertaker";
import UndertakerRegistry from "undertaker-registry";
import vinylFs from "vinyl-fs";
import { CleanOptions } from "../options/clean";
import { CopyOptions } from "../options/copy";
import { CustomTscOptions, mergeTscOptions, TscOptions } from "../options/tsc";
import { ResolvedProject } from "../project";
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
  getCopy,
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
 * Library target with fully resolved paths and dependencies.
 */
interface ResolvedLibTarget extends ResolvedTargetBase {
  readonly project: ResolvedProject;

  readonly srcDir: AbsPosixPath;

  readonly buildDir: AbsPosixPath;

  readonly scripts: Iterable<string>;

  readonly customTypingsDir?: AbsPosixPath;

  readonly tscOptions: TscOptions;

  readonly tsconfigJson: AbsPosixPath;

  readonly mainModule: RelPosixPath;

  readonly typedoc?: ResolvedTypedocOptions;

  readonly dependencies: ResolvedBaseDependencies;

  readonly copy?: ReadonlyArray<CopyOptions>;

  readonly clean?: CleanOptions;

  readonly dist: false | ResolvedDistOptions;
}

export interface DistOptions {
  /**
   * Compiler options for dist builds.
   *
   * The resolved options with be the result of merging the simple build options (base) with
   * the dist options (override).
   *
   * The default value is `{declaration: true}`.
   */
  readonly tscOptions?: CustomTscOptions;

  /**
   * Directory used where the distribution builds will be written.
   *
   * Relative to `project.root`
   * Default: `join(project.distDir, target.name)`
   */
  readonly distDir?: RelPosixPath;

  /**
   * Copy the sources from `target.srcDir` to `target.dist.distDir`. Default: `true`.
   */
  readonly copySrc?: boolean;

  /**
   * Copy operations to perform when distributing the package.
   * The default copies the Markdown files at the project root (so you get `README.md`, `LICENSE.md`, ...).
   *
   * The base values are:
   * - `src`: `project.root`
   * - `dest`: `dist.distDir`
   */
  readonly copy?: CopyOptions[];

  readonly npmPublish?: NpmPublishOptions;

  /**
   * Optional function to apply when copying the `package.json` file to the dist directory.
   */
  packageJsonMap?(old: PackageJson): PackageJson;
}

export interface ResolvedDistOptions {
  /**
   * Compiler options for dist builds.
   */
  readonly tscOptions: CustomTscOptions;

  /**
   * Directory used for distribution builds.
   */
  readonly distDir: AbsPosixPath;

  /**
   * Depending on the value:
   * - `false`: Do not copy the source `.ts` files
   * - `true`: Copy the source `.ts` file from `target.srcDir` to `${target.dist.distDir}/_src`. The custom typings are
   *   copied to `_custom-typings`.
   *
   * Default: `true`.
   */
  readonly copySrc: boolean;

  /**
   * Copy operations to perform when distributing the package.
   * The default copies the Markdown files at the project root (so you get `README.md`, `LICENSE.md`, ...).
   *
   * The base values are:
   * - `src`: `project.root`
   * - `dest`: `dist.distDir`
   */
  readonly copy?: CopyOptions[];

  readonly npmPublish?: NpmPublishOptions;

  /**
   * Optional function to apply when copying the `package.json` file to the dist directory.
   */
  packageJsonMap?(old: PackageJson): PackageJson;
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

export interface ResolvedTypedocOptions {
  readonly dir: AbsPosixPath;

  readonly name: string;

  readonly deploy?: GitDeployOptions;
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
      dir: path.posix.join(base.project.absRoot, target.typedoc.dir),
      name: target.typedoc.name,
      deploy: target.typedoc.deploy,
    };
  }

  let dist: ResolvedDistOptions | false;
  if (target.dist === undefined || target.dist === false) {
    dist = false;
  } else {
    const defaultDistDir: AbsPosixPath = path.posix.join(base.project.absDistDir, target.name);
    const defaultPackageJsonMap: (pkg: PackageJson) => PackageJson = pkg => pkg;
    const defaultCopy: (dest: AbsPosixPath) => CopyOptions[] = (_: AbsPosixPath) => [{
      files: ["./*.md"],
    }];

    const defaultDistTscOptions: TscOptions = {declaration: true};

    if (target.dist === true) { // `true` literal
      dist = {
        tscOptions: mergeTscOptions(base.tscOptions, defaultDistTscOptions),
        distDir: defaultDistDir,
        packageJsonMap: defaultPackageJsonMap,
        npmPublish: {},
        copySrc: true,
        copy: defaultCopy(defaultDistDir),
      };
    } else {
      const distDir: AbsPosixPath = target.dist.distDir !== undefined
        ? path.posix.join(base.project.absRoot, target.dist.distDir)
        : defaultDistDir;
      dist = {
        tscOptions: mergeTscOptions(
          base.tscOptions,
          target.dist.tscOptions !== undefined ? target.dist.tscOptions : defaultDistTscOptions,
        ),
        distDir,
        packageJsonMap: target.dist.packageJsonMap !== undefined ? target.dist.packageJsonMap : defaultPackageJsonMap,
        npmPublish: target.dist.npmPublish,
        copySrc: target.dist.copySrc !== undefined ? target.dist.copySrc : true,
        copy: defaultCopy(distDir),
      };
    }
  }

  return {...base, mainModule: target.mainModule, typedoc, dist};
}

export interface LibTasks extends BaseTasks {
  typedoc?: Undertaker.TaskFunction;
  typedocDeploy?: Undertaker.TaskFunction;
  dist?: Undertaker.TaskFunction;
  distCopy?: Undertaker.TaskFunction;
  distPublish?: Undertaker.TaskFunction;
  distPackageJson?: Undertaker.TaskFunction;
}

/**
 * Generates gulp tasks for the provided lib target.
 *
 * @param taker Undertaker (or Gulp) registry used to generate tasks.
 * @param targetOptions Target configuration.
 */
export function generateLibTasks(taker: Undertaker, targetOptions: LibTarget): LibTasks {
  const target: ResolvedLibTarget = resolveLibTarget(targetOptions);
  const result: LibTasks = <LibTasks> generateBaseTasks(taker, targetOptions);

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
    const typedocOptions: ResolvedTypedocOptions = target.typedoc;
    const typedocTask: Undertaker.TaskFunction = getTypedocTask(tsOptions, typedocOptions);
    result.typedoc = nameTask(
      `${target.name}:typedoc`,
      result.tsconfigJson !== undefined ? taker.series([result.tsconfigJson, typedocTask]) : typedocTask,
    );

    // typedoc:deploy
    if (typedocOptions.deploy !== undefined) {
      const deploy: GitDeployOptions = typedocOptions.deploy;

      async function deployTypedocTask(): Promise<void> {
        const commitMessage: string = `Deploy documentation for ${await getHeadHash()}`;
        return branchPublish({...deploy, dir: typedocOptions.dir, commitMessage});
      }

      result.typedocDeploy = nameTask(
        `${target.name}:typedoc:deploy`,
        taker.series(result.typedoc!, deployTypedocTask),
      );
    }
  }

  // dist
  if (target.dist !== false) {
    const dist: ResolvedDistOptions = target.dist;
    const distTasks: Undertaker.TaskFunction[] = [];
    const copyTasks: Undertaker.TaskFunction[] = [];

    // Locations for compilation: default to the original sources but compile the copied files if copySrc is used
    let srcDir: AbsPosixPath = target.srcDir;
    let customTypingsDir: AbsPosixPath | undefined = target.customTypingsDir;
    // dist:copy:scripts
    if (target.dist.copySrc) {
      srcDir = path.posix.join(dist.distDir, "_src");
      copyTasks.push(nameTask(
        `${target.name}:dist:copy:scripts`,
        (): NodeJS.ReadableStream => {
          return vinylFs
            .src([...target.scripts], {base: target.srcDir})
            .pipe(vinylFs.dest(srcDir));
        },
      ));
      // dist:copy:custom-typings
      if (target.customTypingsDir !== undefined) {
        const srcCustomTypingsDir: AbsPosixPath = target.customTypingsDir;
        const destCustomTypingsDir: AbsPosixPath = path.posix.join(dist.distDir, "_custom-typings");
        customTypingsDir = destCustomTypingsDir;
        copyTasks.push(nameTask(
          `${target.name}:dist:copy:custom-typings`,
          (): NodeJS.ReadableStream => {
            return vinylFs
              .src([path.posix.join(srcCustomTypingsDir, "**/*.d.ts")], {base: srcCustomTypingsDir})
              .pipe(vinylFs.dest(destCustomTypingsDir!));
          },
        ));
      }

      // dist:copy:dist
      if (target.dist.copy !== undefined) {
        const [copyBaseTask, _]: [Undertaker.TaskFunction, Undertaker.TaskFunction] = getCopy(
          taker,
          target.project.absRoot,
          target.dist.distDir,
          target.dist.copy,
        );
        // tslint:disable-next-line:no-unused-expression
        void _; // TODO: Properly unused var error
        copyTasks.push(nameTask(`${target.name}:dist:copy:dist`, copyBaseTask));
      }
    }

    // dist:copy:lib
    if (target.copy !== undefined) {
      const [copyBaseTask, _]: [Undertaker.TaskFunction, Undertaker.TaskFunction] = getCopy(
        taker,
        target.srcDir,
        target.dist.distDir,
        target.copy,
      );
      // tslint:disable-next-line:no-unused-expression
      void _; // TODO: Properly unused var error
      copyTasks.push(nameTask(`${target.name}:dist:copy:lib`, copyBaseTask));
    }

    result.distCopy = nameTask(`${target.name}:dist:copy`, taker.parallel(copyTasks));

    // Resolve tsconfig for `dist`
    const tsconfigJson: AbsPosixPath = path.posix.join(srcDir, "tsconfig.json");
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
      tscOptions: target.dist.tscOptions,
      tsconfigJson,
      customTypingsDir,
      packageJson: target.project.absPackageJson,
      buildDir: dist.distDir,
      srcDir,
      scripts,
    };

    // dist:scripts
    distTasks.push(nameTask(
      `${target.name}:dist:scripts`,
      taker.series(result.distCopy, getBuildTypescriptTask(tsOptions)),
    ));

    // dist:package.json
    {
      async function distPackageJsonTask(): Promise<NodeJS.ReadableStream> {
        let pkg: PackageJson = await readJsonFile(target.project.absPackageJson);
        if (typeof target.mainModule === "string") {
          pkg.main = target.mainModule;
          pkg.types = `${target.mainModule}.d.ts`;
        }
        pkg.gitHead = await getHeadHash();
        if (dist.packageJsonMap !== undefined) {
          pkg = dist.packageJsonMap(pkg);
        }

        return gulpBufferSrc("package.json", Buffer.from(JSON.stringify(pkg, null, 2)))
          .pipe(vinylFs.dest(dist.distDir));
      }

      result.distPackageJson = nameTask(`${target.name}:dist:package.json`, distPackageJsonTask);
      distTasks.push(result.distPackageJson);
    }

    const distTask: Undertaker.TaskFunction = result.clean !== undefined ?
      taker.series(result.clean, taker.parallel(distTasks)) :
      taker.parallel(distTasks);
    result.dist = nameTask(`${target.name}:dist`, distTask);

    if (dist.npmPublish !== undefined) {
      const npmPublishOptions: NpmPublishOptions = dist.npmPublish;
      const npmPublishTask: Undertaker.TaskFunction = async (): Promise<void> => {
        return npmPublish({
          ...npmPublishOptions,
          directory: dist.distDir,
        });
      };
      npmPublishTask.displayName = `${target.name}:dist:publish`;
      taker.task(npmPublishTask);
      result.distPublish = nameTask(`${target.name}:dist:publish`, taker.series(distTask, npmPublishTask));
    }
  }

  return result;
}

/**
 * Generates and registers gulp tasks for the provided lib target.
 *
 * @param taker Undertaker (or Gulp) instance where the tasks will be registered.
 * @param targetOptions Target configuration.
 */
export function registerLibTasks(taker: Undertaker, targetOptions: LibTarget): LibTasks {
  const tasks: LibTasks = generateLibTasks(taker, targetOptions);
  for (const key in tasks) {
    const task: Undertaker.TaskFunction | undefined = (<any> tasks)[key];
    if (task !== undefined) {
      taker.task(task);
    }
  }
  return tasks;
}

export class LibRegistry extends UndertakerRegistry {
  private readonly options: LibTarget;

  constructor(options: LibTarget) {
    super();
    this.options = options;
  }

  init(taker: Undertaker): void {
    registerLibTasks(taker, this.options);
  }
}
