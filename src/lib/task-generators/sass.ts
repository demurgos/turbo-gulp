import Bluebird = require("bluebird");
import {FSWatcher} from "fs";
import {Gulp} from "gulp";
import {Minimatch} from "minimatch";
import gulpSass = require("gulp-sass");
import gulpSourceMaps = require("gulp-sourcemaps");
import {TaskFunction} from "../utils/gulp-task-function";
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
   * gulp-sass options
   */
  sassOptions?: {
    outputStyle?: "compressed" | string;
  };
}

/**
 * Return a list of sources, prefixed by "from"
 */
export function getSources({files, from}: Options): string[] {
  return files.map((val: string): string => asString(join(from, new Minimatch(val))));
}

export function buildSass(gulp: Gulp, options: Options): NodeJS.ReadableStream {
  return gulp
    .src(getSources(options), {base: options.from})
    .pipe(gulpSourceMaps.init())
    .pipe(gulpSass().on("error", gulpSass.logError))
    .pipe(gulpSourceMaps.write())
    .pipe(gulp.dest(options.to));
}

/**
 * Generate a task to build pug files
 */
export function generateTask(gulp: Gulp, options: Options): TaskFunction {
  const task: TaskFunction = function (): NodeJS.ReadableStream {
    return buildSass(gulp, options);
  };
  task.displayName = "_build:sass";
  return task;
}

export function watch(gulp: Gulp, options: Options): FSWatcher {
  const buildTask: TaskFunction = generateTask(gulp, options);
  const sources: string[] = getSources(options);
  return gulp.watch(sources, {cwd: options.from}, buildTask) as FSWatcher;
}
