/**
 * This module generates copy tasks.
 *
 * @module target-tasks/copy
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { FSWatcher } from "fs";
import { Furi, toSysPath } from "furi";
import globWatcher from "glob-watcher";
import { Minimatch } from "minimatch";
import { TaskFunction } from "undertaker";
import vinylFs from "vinyl-fs";
import { asString, join } from "../utils/matcher";

export interface Options {
  /**
   * An array of minimatch patterns
   */
  files: string[];

  /**
   * Base-directory for copy
   */
  from: string;

  /**
   * Target directory
   */
  to: string;
}

export interface ResolvedCopyOptions {
  /**
   * An array of minimatch patterns
   */
  files: string[];

  /**
   * Base-directory for copy
   */
  from: Furi;

  /**
   * Target directory
   */
  to: Furi;
}

/**
 * Returns a list of sources, prefixed by "from"
 */
export function getSources({files, from}: ResolvedCopyOptions): string[] {
  return files.map((val: string): string => asString(join(toSysPath(from.toString()), new Minimatch(val))));
}

export function copy(options: ResolvedCopyOptions): NodeJS.ReadableStream {
  return vinylFs
    .src(getSources(options), {base: toSysPath(options.from.toString())})
    .pipe(vinylFs.dest(toSysPath(options.to.toString())));
}

/**
 * Generate a task to copy files from one directory to an other.
 */
export function generateTask(options: ResolvedCopyOptions): TaskFunction {
  const task: TaskFunction = function (): NodeJS.ReadableStream {
    return copy(options);
  };
  task.displayName = "_copy";
  return task;
}

export function watch(options: ResolvedCopyOptions): FSWatcher {
  const buildTask: TaskFunction = generateTask(options);
  const sources: string[] = getSources(options);
  return globWatcher(sources, {cwd: toSysPath(options.from.toString())}, buildTask);
}
