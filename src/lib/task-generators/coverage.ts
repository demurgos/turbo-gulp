import { TaskFunction } from "undertaker";
import { AbsPosixPath } from "../types";
import { NycReporter, run as runCoverage } from "../utils/coverage";
import { getCommand as getMochaCommand } from "../utils/mocha";
import { MochaOptions, resolveMochaOptions } from "./mocha";

export interface CoverageOptions {
  test: MochaOptions;
  rootDir: AbsPosixPath;
  tempDir: AbsPosixPath;
  reportDir: AbsPosixPath;
  reporters: NycReporter[];
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
