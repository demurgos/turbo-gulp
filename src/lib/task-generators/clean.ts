import Bluebird = require("bluebird");
import {Gulp, TaskFunction} from "gulp";
import {Minimatch} from "minimatch";
import {posix as path} from "path";
import del = require("del");
import * as matcher from "../utils/matcher";

export interface Options {
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

interface Sources {
  dirs: string[];
  files: string[];
}

/**
 * Return a list of files, prefixed by "base"
 */
function getFiles(options: Options): string[] {
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
export function generateTask(gulp: Gulp, options: Options): TaskFunction {
  return function () {
    return del(getFiles(options));
  };
}
