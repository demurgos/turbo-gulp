/**
 * Helpers to run test coverage using c8.
 *
 * @module utils/coverage
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Incident } from "incident";
import { toPosix } from "../project";
import { AbsPosixPath } from "../types";
import { SpawnedProcess, SpawnOptions, SpawnResult } from "./node-async";

/**
 * Absolute path to the `c8` CLI script.
 */
const C8_BIN: AbsPosixPath = toPosix(require.resolve("c8/bin/c8.js")) as AbsPosixPath;

export async function execC8(
  args: string[],
  experimentalModules: boolean = false,
  options?: SpawnOptions,
): Promise<SpawnResult> {
  // tslint:disable-next-line:typedef
  const env = experimentalModules ? {...process.env, NODE_OPTIONS: "--experimental-modules"} : undefined;
  return new SpawnedProcess(
    "node",
    [C8_BIN, ...args],
    {stdio: "pipe", env, ...options},
  ).toPromise();
}

export type NycReporter = "text" | "text-lcov" | "lcovonly" | "html";

export interface RunOptions {
  cwd: AbsPosixPath;
  command: string[];
  reporters: NycReporter[];
  reportDir: AbsPosixPath;
  tempDir: AbsPosixPath;
  include?: string[];
  colors?: boolean;

  /**
   * Use `--experimental-modules`. Default:  false`.
   */
  experimentalModules?: boolean;
}

export async function run(options: RunOptions): Promise<void> {
  const args: string[] = [];
  args.push("--cwd", options.cwd);
  for (const reporter of options.reporters) {
    args.push("--reporter", reporter);
  }
  args.push("--report-dir", options.reportDir);
  args.push("--temp-dir", options.tempDir);
  if (options.colors) {
    args.push("--color");
  }
  args.push("--", ...options.command);

  const experimentalModules: boolean = options.experimentalModules || false;
  const result: SpawnResult = await execC8(args, experimentalModules, {cwd: options.cwd, stdio: "inherit"});
  if (result.exit.type === "code") {
    if (result.exit.code === 0) {
      return;
    }
    throw Incident("CoverageError", {args});
  }
  throw new Incident("UnexpectedExitValue", {exit: result.exit});
}
