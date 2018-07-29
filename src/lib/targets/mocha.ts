/**
 * This module defines the _mocha_ target type used to build and run Mocha tests.
 *
 * In the following list of tasks, `{target}` represents the name of the target as defined by the `name` property
 * of the target options.
 * The _lib_ target provides the following tasks:
 *
 * ## {target}
 *
 * Build and run the tests, use the console reporter.
 *
 * ## {target}:build
 *
 * Performs a full test build of the library and test files.
 *
 * ## {target}:run
 *
 * Only run the tests (does not build the tests).
 *
 * ## {target}:coverage
 *
 * Run tests with coverage (does not build the tests).
 *
 * ## {target}:typedoc:deploy
 *
 * Deploy the _Typedoc_ documentation using _git_. This can be used to easily deploy the documentation to the
 * `gh-pages` branch.
 *
 * ## {target}:clean
 *
 * Remove the build and directory corresponding to this target.
 *
 * ## {target}:tsconfig.json
 *
 * Emit a `tsconfig.json` file corresponding to the configuration for this target. This allows to compile it using
 * the command line `tsc` program. This is also useful for IDE to auto-detect the configuration of the project.
 *
 * @module targets/mocha
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { posix as posixPath } from "path";
import Undertaker, { TaskFunction } from "undertaker";
import UndertakerRegistry from "undertaker-registry";
import { hasJsOutput, hasMjsOutput } from "../options/tsc";
import { CoverageOptions, generateTask as generateCoverageTask } from "../task-generators/coverage";
import * as mocha from "../task-generators/mocha";
import { MochaOptions, MochaReporter } from "../task-generators/mocha";
import { generateMochaMainTask } from "../task-generators/mocha-main";
import { NycReporter } from "../utils/coverage";
import { BaseTasks, generateBaseTasks, nameTask, ResolvedTargetBase, resolveTargetBase, TargetBase } from "./_base";

/**
 * Represents a test build using Mocha, it runs with Node.
 */
export interface MochaTarget extends TargetBase {
  /**
   * Controls the Mocha entry points.
   *
   * The default value is `true`.
   *
   * - If `false`, the glob patterns for the entry points are passed to mocha
   *   directly.
   * - If `true`, an the files are globbed at build time to generate an entry
   *   point.
   *   - If `.mjs` files are emitted, a `test.esm.js` is generated.
   *     It contains an async IIFE. Each test file is mapped to
   *     `await import(/* file *\/);`.
   *   - If `*.js` files are emitted, a `test.cjs.js` is generated.
   *     It contains an IIFE. Each test file is mapped to
   *     `require(/* file *\/);`.
   *
   * - If `.mjs` files are emitted, use `*.spec.mjs`
   * - If `.js` files are emitted, use `*.spec.js`
   * - If both `.js` & `.mjs` files are emitted, TODO: explanation (default to mjs but add task to run cjs manually)
   */
  generateTestMain?: boolean;

  /**
   * Mocha test reporter to use.
   *
   * Default: `"spec"`
   */
  testReporter?: MochaReporter;
}

/**
 * Mocha target with fully resolved paths and dependencies.
 */
interface ResolvedMochaTarget extends ResolvedTargetBase {
  generateTestMain: boolean;
  testReporter: MochaReporter;
}

/**
 * Resolve absolute paths and dependencies for the provided target.
 *
 * @param target Non-resolved target.
 * @return Resolved target.
 */
function resolveMochaTarget(target: MochaTarget): ResolvedMochaTarget {
  const base: ResolvedTargetBase = resolveTargetBase(target);
  const generateTestMain: boolean = target.generateTestMain !== undefined ? target.generateTestMain : true;
  return {...base, generateTestMain, testReporter: "spec"};
}

export interface MochaTasks extends BaseTasks {
  start: TaskFunction;
  run: TaskFunction;
  runCjs?: TaskFunction;
  runEsm?: TaskFunction;
  coverageCjs?: TaskFunction;
  coverageEsm?: TaskFunction;
}

/**
 * Generates gulp tasks for the provided Mocha target.
 *
 * @param taker Undertaker (or Gulp) registry used to generate tasks.
 * @param targetOptions Target configuration.
 */
export function generateMochaTasks(taker: Undertaker, targetOptions: MochaTarget): MochaTasks {
  const target: ResolvedMochaTarget = resolveMochaTarget(targetOptions);
  const result: MochaTasks = <MochaTasks> generateBaseTasks(taker, targetOptions);

  let cjsSpecGlob: undefined | string = hasJsOutput(target.tscOptions) ? "**/*.spec.js" : undefined;
  let esmSpecGlob: undefined | string = hasMjsOutput(target.tscOptions) ? "**/*.spec.mjs" : undefined;

  if (target.generateTestMain) {
    const buildBase: TaskFunction = nameTask(`${target.name}:build:base`, result.build);
    const mochaMains: TaskFunction[] = [];

    if (cjsSpecGlob !== undefined) {
      const mochaMain: string = "test.cjs.js";
      mochaMains.push(nameTask(`${target.name}:build:main:cjs`, generateMochaMainTask({
        sources: cjsSpecGlob,
        base: target.buildDir,
        target: mochaMain,
        mode: "cjs",
      })));
      cjsSpecGlob = mochaMain;
    }
    if (esmSpecGlob !== undefined) {
      const mochaMain: string = "test.esm.js";
      mochaMains.push(nameTask(`${target.name}:build:main:esm`, generateMochaMainTask({
        sources: esmSpecGlob,
        base: target.buildDir,
        target: mochaMain,
        mode: "esm",
      })));
      esmSpecGlob = mochaMain;
    }

    const buildMochaMain: TaskFunction = nameTask(`${target.name}:build:main`, taker.parallel(mochaMains));
    result.build = nameTask(`${target.name}:build`, taker.series([buildBase, buildMochaMain]));
    result.watch = undefined;
  }

  // tslint:disable-next-line:typedef
  const mochaOptionsBase = {
    rootDir: target.project.absRoot,
    testDir: target.buildDir,
    colors: true,
    reporter: target.testReporter,
  };

  const runTasks: TaskFunction[] = [];

  // tslint:disable-next-line:typedef
  const coverageOptionsBase = {
    rootDir: target.project.absRoot,
    reportDir: posixPath.join(target.project.absRoot, "coverage"),
    tempDir: posixPath.join(target.project.absRoot, ".coverage"),
    reporters: ["text", "lcovonly", "html"] as NycReporter[],
    colors: true,
  };

  if (esmSpecGlob !== undefined) {
    const testOptions: MochaOptions = {...mochaOptionsBase, glob: esmSpecGlob, experimentalModules: true};
    result.runEsm = nameTask(`${target.name}:run:esm`, mocha.generateTask(testOptions));
    runTasks.push(result.runEsm);
    const coverageOptions: CoverageOptions = {...coverageOptionsBase, test: testOptions};
    result.coverageEsm = nameTask(`${target.name}:coverage:esm`, generateCoverageTask(coverageOptions));
  }
  if (cjsSpecGlob !== undefined) {
    const testOptions: MochaOptions = {...mochaOptionsBase, glob: cjsSpecGlob};
    result.runCjs = nameTask(`${target.name}:run:cjs`, mocha.generateTask(testOptions));
    runTasks.push(result.runCjs);
    const coverageOptions: CoverageOptions = {...coverageOptionsBase, test: testOptions};
    result.coverageCjs = nameTask(`${target.name}:coverage:cjs`, generateCoverageTask(coverageOptions));
  }

  // run
  result.run = nameTask(`${target.name}:run`, taker.series(runTasks));

  // start
  const startTasks: TaskFunction[] = [];
  if (result.clean !== undefined) {
    startTasks.push(result.clean);
  }
  startTasks.push(result.build);

  let defaultCoverage: TaskFunction;
  if (result.coverageEsm !== undefined) {
    defaultCoverage = result.coverageEsm;
  } else if (result.coverageCjs !== undefined) {
    defaultCoverage = result.coverageCjs;
  } else {
    throw new Error("AssertionFailed: Expected either CJS or ESM coverage task to be defined.");
  }

  startTasks.push(defaultCoverage);
  result.start = nameTask(target.name, taker.series(startTasks));

  return result;
}

/**
 * Generates and registers gulp tasks for the provided Mocha target.
 *
 * @param taker Undertaker (or Gulp) instance where the tasks will be registered.
 * @param targetOptions Target configuration.
 */
export function registerMochaTasks(taker: Undertaker, targetOptions: MochaTarget): MochaTasks {
  const tasks: MochaTasks = generateMochaTasks(taker, targetOptions);
  for (const key in tasks) {
    const task: TaskFunction | undefined = (<any> tasks)[key];
    if (task !== undefined) {
      taker.task(task);
    }
  }
  return tasks;
}

export class MochaRegistry extends UndertakerRegistry {
  private readonly options: MochaTarget;

  constructor(options: MochaTarget) {
    super();
    this.options = options;
  }

  init(taker: Undertaker): void {
    registerMochaTasks(taker, this.options);
  }
}
