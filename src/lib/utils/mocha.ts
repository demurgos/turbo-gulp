import { Incident } from "incident";
import { IMinimatch, Minimatch } from "minimatch";
import { toPosix } from "../project";
import { MochaOptions, MochaReporter, ResolvedMochaOptions, resolveMochaOptions } from "../task-generators/mocha";
import { AbsPosixPath } from "../types";
import * as matcher from "./matcher";
import { SpawnedProcess, SpawnOptions, SpawnResult } from "./node-async";

const MOCHA_BIN: AbsPosixPath = toPosix(require.resolve("mocha/bin/mocha"));

export async function execMocha(args: string[] = [], options?: SpawnOptions): Promise<SpawnResult> {
  return new SpawnedProcess(
    MOCHA_BIN,
    args,
    {stdio: "pipe", ...options},
  ).toPromise();
}

export interface Sources {
  baseDir: string;
  specs: string[];
}

export function getSources(options: {mjs: boolean; testDir: AbsPosixPath}): Sources {
  const baseDir: string = options.testDir;
  const glob: IMinimatch = new Minimatch(options.mjs ? "**/*.spec.mjs" : "**/*.spec.js");
  const specs: string = matcher.asString(matcher.join(baseDir, glob));

  return {
    baseDir,
    specs: [specs],
  };
}

/**
 * Return the command line arguments equivalent to this task
 *
 * @param options Mocha options
 * @return Command line arguments
 */
export function getCommand(options: GetCommandArgsOptions): string[] {
  return [MOCHA_BIN, ...getCommandArgs(options)];
}

export interface GetCommandArgsOptions {
  testDir: AbsPosixPath;
  reporter: MochaReporter;
  colors: boolean;
  mjs: boolean;
}

export function getCommandArgs(options: GetCommandArgsOptions): string[] {
  const sources: Sources = getSources(options);
  const result: string[] = [];
  result.push("--ui", "bdd");
  result.push("--reporter", options.reporter);
  if (options.colors) {
    result.push("--colors");
  }
  if (options.mjs) {
    result.push("--require", "esm");
  }
  result.push("--", ...sources.specs);
  return result;
}

export interface RunOptions {
  cwd: AbsPosixPath;
  testDir: AbsPosixPath;
  reporter: MochaReporter;
  mjs: boolean;
  colors: boolean;
}

export async function run(options: RunOptions): Promise<void> {
  const args: string[] = getCommandArgs(options);

  const result: SpawnResult = await execMocha(args, {cwd: options.cwd, stdio: "inherit"});
  if (result.exit.type === "code") {
    if (result.exit.code === 0) {
      return;
    }
    throw Incident("TestError");
  }
  throw new Incident("UnexpectedExitValue", {exit: result.exit});
}
