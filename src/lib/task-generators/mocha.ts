import { TaskFunction } from "undertaker";
import { AbsPosixPath } from "../types";
import * as mocha from "../utils/mocha";

export type MochaReporter = "spec";

export interface MochaOptions {
  rootDir: AbsPosixPath;
  testDir: AbsPosixPath;
  glob: string;
  experimentalModules?: boolean;
  colors?: boolean;
  reporter?: MochaReporter;
}

export interface ResolvedMochaOptions {
  rootDir: AbsPosixPath;
  testDir: AbsPosixPath;
  glob: string;
  experimentalModules: boolean;
  colors: boolean;
  reporter: MochaReporter;
}

export function resolveMochaOptions(options: MochaOptions): ResolvedMochaOptions {
  return {experimentalModules: false, colors: false, reporter: "spec", ...options};
}

export function generateTask(options: MochaOptions): TaskFunction {
  const resolved: ResolvedMochaOptions = resolveMochaOptions(options);

  const task: TaskFunction = async function (): Promise<void> {
    return mocha.run({
      cwd: resolved.rootDir,
      testDir: resolved.testDir,
      glob: resolved.glob,
      experimentalModules: resolved.experimentalModules,
      colors: resolved.colors,
      reporter: resolved.reporter,
    });
  };
  task.displayName = getTaskName();

  return task;
}

export function getTaskName(): string {
  return "_:mocha:run";
}
