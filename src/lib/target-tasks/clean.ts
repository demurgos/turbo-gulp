/**
 * This module generates clean-up tasks.
 *
 * @module target-tasks/clean
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import del from "del";
import { Minimatch } from "minimatch";
import { posix as path } from "path";
import { TaskFunction } from "undertaker";
import * as matcher from "../utils/matcher";

export interface CleanOptions {
  /**
   * Base-directory for clean (usually `project.root`)
   */
  base: string;

  /**
   * An array of relative paths to directories to delete
   */
  dirs?: string[];

  /**
   * An array of minimatch patterns
   */
  files?: string[];
}

/**
 * Return a list of files, prefixed by "base"
 */
function getFiles(options: CleanOptions): string[] {
  const files: string[] = [];

  if (options.dirs !== undefined) {
    for (const dir of options.dirs) {
      files.push(path.join(options.base, dir));
    }
  }

  if (options.files !== undefined) {
    for (const file of options.files) {
      files.push(matcher.asString(matcher.join(options.base, new Minimatch(file))));
    }
  }

  return files;
}

/**
 * Generate a task to clean files
 */
export function generateTask(options: CleanOptions): TaskFunction {
  return async function () {
    return del(getFiles(options));
  };
}
