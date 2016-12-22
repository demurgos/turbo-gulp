import Bluebird = require("bluebird");
import {Gulp, TaskFunction} from "gulp";
import {Minimatch} from "minimatch";
import {posix as path} from "path";
import gulpPug = require("gulp-pug");
import {asString, join} from "../utils/matcher";

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

  /**
   * gulp-pug options
   */
  pugOptions?: {
    locals?: {};
  };
}

/**
 * Return a list of sources, prefixed by "from"
 */
export function getSources({files, from}: Options): string[] {
  return files.map((val: string): string => asString(join(from, new Minimatch(val))));
}

export function buildPug(gulp: Gulp, options: Options): NodeJS.ReadableStream {
  return gulp
    .src(getSources(options), {base: options.from})
    .pipe(gulpPug(options.pugOptions))
    .pipe(gulp.dest(options.to));
}

/**
 * Generate a task to build pug files
 */
export function generateTask(gulp: Gulp, options: Options): TaskFunction {
  return function (): NodeJS.ReadableStream {
    return buildPug(gulp, options);
  };
}
