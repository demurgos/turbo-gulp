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
import * as mocha from "../task-generators/mocha";
import { MochaOptions, MochaReporter } from "../task-generators/mocha";
import { generateMochaMainTask } from "../task-generators/mocha-main";
import * as nyc from "../task-generators/nyc";
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
  coverage: TaskFunction;
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

  // Will use the `run:cjs` with fallback to `run:esm`
  let testOptions: MochaOptions | undefined = undefined;

  if (esmSpecGlob !== undefined) {
    testOptions = {...mochaOptionsBase, glob: esmSpecGlob, experimentalModules: true};
    result.runEsm = nameTask(`${target.name}:run:esm`, mocha.generateTask(testOptions));
    runTasks.push(result.runEsm);
  }
  if (cjsSpecGlob !== undefined) {
    testOptions = {...mochaOptionsBase, glob: cjsSpecGlob};
    result.runCjs = nameTask(`${target.name}:run:cjs`, mocha.generateTask(testOptions));
    runTasks.push(result.runCjs);
  }
  if (testOptions === undefined) {
    throw new Error("AssertionFailed: Expected `testOptions` to be defined");
  }

  // run
  result.run = nameTask(`${target.name}:run`, taker.series(runTasks));

  const coverageOptions: nyc.NycOptions = {
    test: testOptions,
    rootDir: target.project.absRoot,
    reportDir: posixPath.join(target.project.absRoot, "coverage"),
    tempDir: posixPath.join(target.project.absRoot, ".nyc_output"),
    reporters: ["text", "lcovonly", "html"],
  };

  // coverage
  result.coverage = nameTask(`${target.name}:coverage`, nyc.generateTask(coverageOptions));

  // start
  const startTasks: TaskFunction[] = [];
  if (result.clean !== undefined) {
    startTasks.push(result.clean);
  }
  startTasks.push(result.build);
  startTasks.push(result.coverage);
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
