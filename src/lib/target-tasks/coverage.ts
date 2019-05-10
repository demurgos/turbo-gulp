/**
 * This module generates tasks to run tests with coverage.
 *
 * @module target-tasks/coverage
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { TaskFunction } from "undertaker";
import { AbsPosixPath } from "../types";
import { C88Reporter, run as runCoverage } from "../utils/coverage";
import { getCommand as getMochaCommand } from "../utils/mocha";
import { MochaOptions, resolveMochaOptions } from "./mocha";

export interface CoverageOptions {
  test: MochaOptions;
  rootDir: AbsPosixPath;
  tempDir: AbsPosixPath;
  reportDir: AbsPosixPath;
  reporters: C88Reporter[];
  colors: boolean;
}

export function generateTask(options: CoverageOptions): TaskFunction {
  const testCommand: string[] = getMochaCommand(resolveMochaOptions(options.test));
  const cwd: AbsPosixPath = options.rootDir;

  const task: TaskFunction = async function (): Promise<void> {
    return runCoverage({
      cwd,
      command: testCommand,
      reporters: options.reporters,
      reportDir: options.reportDir,
      tempDir: options.tempDir,
      colors: options.colors,
      experimentalModules: options.test.experimentalModules,
    });
  };
  task.displayName = getTaskName();

  return task;
}

export function getTaskName(): string {
  return "_:coverage";
}
