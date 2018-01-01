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

/** (Placeholder comment, see christopherthielen/typedoc-plugin-external-module-name#6) */

import { Gulp, TaskFunction } from "gulp";
import { posix as posixPath } from "path";
import * as mocha from "../task-generators/mocha";
import * as nyc from "../task-generators/nyc";
import { BaseTasks, nameTask, registerBaseTasks, ResolvedTargetBase, resolveTargetBase, TargetBase } from "./_base";

/**
 * Represents a test build using Mocha, it runs with Node.
 */
export interface MochaTarget extends TargetBase {
}

/**
 * Mocha target with fully resolved paths and dependencies.
 */
interface ResolvedMochaTarget extends ResolvedTargetBase {
}

/**
 * Resolve absolute paths and dependencies for the provided target.
 *
 * @param target Non-resolved target.
 * @return Resolved target.
 */
function resolveMochaTarget(target: MochaTarget): ResolvedMochaTarget {
  return resolveTargetBase(target);
}

export interface MochaTasks extends BaseTasks {
  start: TaskFunction;
  run: TaskFunction;
  coverage: TaskFunction;
}

/**
 * Generates gulp tasks for the provided Mocha target.
 *
 * @param gulp Gulp instance used to generate tasks manipulating files.
 * @param targetOptions Target configuration.
 */
export function generateMochaTasks(gulp: Gulp, targetOptions: MochaTarget): MochaTasks {
  const target: ResolvedMochaTarget = resolveMochaTarget(targetOptions);
  const result: MochaTasks = <MochaTasks> registerBaseTasks(gulp, targetOptions);

  const testOptions: mocha.MochaOptions = {
    testDir: target.buildDir,
  };

  // run
  result.run = nameTask(`${target.name}:run`, mocha.generateTask(gulp, testOptions));

  const coverageOptions: nyc.NycOptions = {
    test: testOptions,
    rootDir: target.project.absRoot,
    reportDir: posixPath.join(target.project.absRoot, "coverage"),
    tempDir: posixPath.join(target.project.absRoot, ".nyc_output"),
    reporters: ["text", "lcovonly", "html"],
  };

  // coverage
  result.coverage = nameTask(`${target.name}:coverage`, nyc.generateTask(gulp, coverageOptions));

  // start
  const startTasks: TaskFunction[] = [];
  if (result.clean !== undefined) {
    startTasks.push(result.clean);
  }
  startTasks.push(result.build);
  startTasks.push(result.coverage);
  result.start = nameTask(target.name, gulp.series(startTasks));

  return result;
}

/**
 * Generates and registers gulp tasks for the provided Mocha target.
 *
 * @param gulp Gulp instance where the tasks will be registered.
 * @param targetOptions Target configuration.
 */
export function registerMochaTasks(gulp: Gulp, targetOptions: MochaTarget): MochaTasks {
  const tasks: MochaTasks = generateMochaTasks(gulp, targetOptions);
  for (const key in tasks) {
    const task: TaskFunction | undefined = (<any> tasks)[key];
    if (task !== undefined) {
      gulp.task(task);
    }
  }
  return tasks;
}
