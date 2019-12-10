/**
 * Helpers to run test coverage using c8.
 *
 * @module utils/coverage
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { execCli as execC88Cli } from "c88/cli";
import { Furi } from "furi";
import { Incident } from "incident";

export type C88Reporter =  "html" | "lcov" | "lcov-file" | "text" | "text-file";

export interface RunOptions {
  cwd: Furi;
  command: string[];
  reporters: C88Reporter[];
  reportDir: Furi;
  tempDir: Furi;
  include?: string[];
  colors?: boolean;

  /**
   * Use `--experimental-modules`. Default:  false`.
   */
  experimentalModules?: boolean;
}

export async function run(options: RunOptions): Promise<void> {
  const args: string[] = [];
  for (const reporter of options.reporters) {
    args.push("--reporter", reporter);
  }
  if (options.colors) {
    args.push("--color");
  }
  args.push("--", ...options.command);

  const returnCode: number = await execC88Cli(args, options.cwd.toSysPath(), process);

  if (returnCode !== 0) {
    throw Incident("CoverageError", {args});
  }
}
