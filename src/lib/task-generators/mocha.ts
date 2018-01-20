import { Gulp } from "gulp";
import { AbsPosixPath } from "../types";
import { TaskFunction } from "../utils/gulp-task-function";
import * as mocha from "../utils/mocha";

export type MochaReporter = "spec";

export interface MochaOptions {
  rootDir: AbsPosixPath;
  testDir: AbsPosixPath;
  reporter?: MochaReporter;
  /**
   * Test `.spec.mjs` files instead of `.spec.js` (mixed is not supported)
   * Default: `false`
   */
  mjs?: boolean;
  colors?: boolean;
}

export interface ResolvedMochaOptions {
  rootDir: AbsPosixPath;
  testDir: AbsPosixPath;
  reporter: MochaReporter;
  mjs: boolean;
  colors: boolean;
}

export function resolveMochaOptions(options: MochaOptions): ResolvedMochaOptions {
  return {reporter: "spec", mjs: false, colors: true, ...options};
}

export function generateTask(gulp: Gulp, options: MochaOptions): TaskFunction {
  const resolved: ResolvedMochaOptions = resolveMochaOptions(options);

  const task: TaskFunction = async function (): Promise<void> {
    return mocha.run({
      cwd: resolved.rootDir,
      testDir: resolved.testDir,
      reporter: resolved.reporter,
      colors: true,
      mjs: resolved.mjs,
    });
  };
  task.displayName = getTaskName();

  return task;
}

export function getTaskName(): string {
  return "_:mocha:run";
}
