import { Gulp } from "gulp";
import { AbsPosixPath } from "../types";
import { TaskFunction } from "../utils/gulp-task-function";
import { getCommand as getMochaCommand } from "../utils/mocha";
import * as nyc from "../utils/nyc";
import { NycReporter } from "../utils/nyc";
import { MochaOptions, resolveMochaOptions } from "./mocha";

export interface NycOptions {
  test: MochaOptions;
  rootDir: AbsPosixPath;
  tempDir: AbsPosixPath;
  reportDir: AbsPosixPath;
  reporters: NycReporter[];
}

export function generateTask(gulp: Gulp, options: NycOptions): TaskFunction {
  const testCommand: string[] = getMochaCommand(resolveMochaOptions(options.test));
  const cwd: AbsPosixPath = options.rootDir;

  const task: TaskFunction = async function (): Promise<void> {
    return nyc.run({
      cwd,
      command: testCommand,
      reporters: options.reporters,
      reportDir: options.reportDir,
      tempDir: options.tempDir,
      colors: true,
    });
  };
  task.displayName = getTaskName();

  return task;
}

export function getTaskName(): string {
  return "_:coverage";
}
