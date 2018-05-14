/**
 * Helpers to run Mocha.
 *
 * @module utils/mocha
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Incident } from "incident";
import { IMinimatch, Minimatch } from "minimatch";
import { toPosix } from "../project";
import { MochaReporter } from "../task-generators/mocha";
import { AbsPosixPath } from "../types";
import * as matcher from "./matcher";
import { SpawnedProcess, SpawnOptions, SpawnResult } from "./node-async";

/**
 * Absolute path to the Mocha CLI script.
 */
const MOCHA_BIN: AbsPosixPath = toPosix(require.resolve("mocha/bin/mocha")) as AbsPosixPath;

/**
 * Runs the Mocha CLI with the provided arguments.
 *
 * @param args Array of CLI arguments.
 * @param options Extra options for the spawned process.
 * @return Promise for the execution result.
 */
export async function execMocha(args: string[] = [], options?: SpawnOptions): Promise<SpawnResult> {
  return new SpawnedProcess(
    "node",
    [MOCHA_BIN, ...args],
    {stdio: "pipe", ...options},
  ).toPromise();
}

/**
 * Resolved locations of the Mocha spec files.
 */
export interface Sources {
  /**
   * Base directory containing the tests.
   */
  baseDir: AbsPosixPath;

  /**
   * Array of absolute Minimatch patterns for spec files.
   *
   * They either end in `.spec.mjs` or `.spec.js`.
   */
  specs: ReadonlyArray<string>;
}

/**
 * Resolve locations of the Mocha spec files.
 *
 * @param options Resolution options. It `mjs` is `true`, resolve `*.spec.mjs` files else `*.spec.js` from `testDir`.
 * @return Resolved locations.
 */
export function getSources(options: {mjs: boolean; testDir: AbsPosixPath}): Sources {
  const baseDir: AbsPosixPath = options.testDir;
  const glob: IMinimatch = new Minimatch(options.mjs ? "**/*.spec.mjs" : "**/*.spec.js");
  const specs: string = matcher.asString(matcher.join(baseDir, glob));

  return {
    baseDir,
    specs: [specs],
  };
}

/**
 * Returns the command line arguments equivalent to this task
 *
 * @param options Mocha options
 * @return Command line arguments
 */
export function getCommand(options: GetCommandArgsOptions): string[] {
  return [MOCHA_BIN, ...getCommandArgs(options)];
}

/**
 * Options for the [[getCommandArgs]] function.
 */
export interface GetCommandArgsOptions {
  /**
   * Directory containing the tested files.
   */
  testDir: AbsPosixPath;

  /**
   * Mocha reporter used to display the test results.
   */
  reporter: MochaReporter;

  /**
   * Enable colored terminal output.
   */
  colors: boolean;

  /**
   * If `mjs` is true, use `*.spec.mjs` files and require the `esm` loader.
   * Otherwise, use `*.spec.js` files.
   */
  mjs: boolean;
}

/**
 * Builds command line arguments for Mocha.
 *
 * @param options Controls the generated arguments.
 * @return The corresponding list of command line arguments.
 */
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

/**
 * Options used to run Mocha,
 */
export interface RunOptions {
  /**
   * Current working directory for the Mocha execution.
   */
  cwd: AbsPosixPath;

  /**
   * Directory containing the spec files.
   */
  testDir: AbsPosixPath;

  /**
   * Mocha reporter used to display the test results.
   */
  reporter: MochaReporter;

  /**
   * If `mjs` is true, use `*.spec.mjs` files and require the `esm` loader.
   * Otherwise, use `*.spec.js` files.
   */
  mjs: boolean;

  /**
   * Enable colored terminal output.
   */
  colors: boolean;
}

/**
 * Runs Mocha BDD tests with the provided options.
 *
 * @param options
 * @return Promise resolved once the tests end. If Mocha ends with a non-zero exit code, the promise is rejected with
 *         the `TestError` error.
 */
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
