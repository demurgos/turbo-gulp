/**
 * This module generates clean-up tasks.
 *
 * @module target-tasks/clean
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import del from "del";
import { Furi } from "furi";
import { TaskFunction } from "undertaker";
import { MatcherUri } from "../utils/matcher";

export interface ResolvedCleanOptions {
  /**
   * Base-directory for clean (usually `project.root`)
   */
  base: Furi;

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
function getFiles(options: ResolvedCleanOptions): MatcherUri[] {
  const files: MatcherUri[] = [];

  if (options.dirs !== undefined) {
    for (const dir of options.dirs) {
      files.push(MatcherUri.from(options.base, dir));
    }
  }

  if (options.files !== undefined) {
    for (const file of options.files) {
      files.push(MatcherUri.from(options.base, file));
    }
  }

  return files;
}

/**
 * Generate a task to clean files
 */
export function generateTask(options: ResolvedCleanOptions): TaskFunction {
  return async function () {
    return del(getFiles(options).map(x => x.toMinimatchString()));
  };
}
