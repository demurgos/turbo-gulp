/**
 * This module generates copy tasks.
 *
 * @module target-tasks/copy
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { FSWatcher } from "fs";
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

/**
 * Return a list of sources, prefixed by "from"
 */
export function getSources({files, from}: Options): string[] {
  return files.map((val: string): string => asString(join(from, new Minimatch(val))));
}

export function copy(options: Options): NodeJS.ReadableStream {
  return vinylFs
    .src(getSources(options), {base: options.from})
    .pipe(vinylFs.dest(options.to));
}

/**
 * Generate a task to copy files from one directory to an other.
 */
export function generateTask(options: Options): TaskFunction {
  const task: TaskFunction = function (): NodeJS.ReadableStream {
    return copy(options);
  };
  task.displayName = "_copy";
  return task;
}

export function watch(options: Options): FSWatcher {
  const buildTask: TaskFunction = generateTask(options);
  const sources: string[] = getSources(options);
  return globWatcher(sources, {cwd: options.from}, buildTask) as FSWatcher;
}
