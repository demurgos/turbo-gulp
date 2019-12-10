/**
 * This module generates tasks to create entry points for Mocha tests.
 *
 * @module target-tasks/mocha-main
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Furi } from "furi";
import { TaskFunction } from "undertaker";
import { requireAll } from "../require-all";
import { RelPosixPath } from "../types";

const DEFAULT_MOCHA_MAIN_TASK_NAME: string = "_:build:mocha-main";

export interface MochaMainOptions {
  /**
   * `glob` patterns matching the files to select.
   */
  sources: string;

  /**
   * Base directory for wildstar `**` expansion.
   *
   * Absolute POSIX path.
   */
  base: Furi;

  /**
   * Target file where the result will be written.
   *
   * Relative POSIX path, resolved from `.base`.
   */
  target: RelPosixPath;

  /**
   * Output mode.
   * - `"cjs"` means to use a sequence of `require(...)`.
   * - `"esm"` means to use a sequence of `await import(...)`
   */
  mode: "cjs" | "esm";
}

export function generateMochaMainTask(options: MochaMainOptions): TaskFunction {
  const task: TaskFunction = async function (): Promise<void> {
    return requireAll({suffix: options.mode === "esm" ? "  run();" : undefined, ...options});
  };
  task.displayName = DEFAULT_MOCHA_MAIN_TASK_NAME;

  return task;
}
