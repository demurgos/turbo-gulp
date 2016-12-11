import {Gulp, TaskFunction} from "gulp";
import gulpSourceMaps = require("gulp-sourcemaps");
import gulpTypescript = require("gulp-typescript");
import {assign} from "lodash";
import merge = require("merge2");
import {Minimatch} from "minimatch";
import * as path from "path";

import {DEV_TSC_OPTIONS} from "../config/tsc";
import * as matcher from "../utils/matcher";

export interface Options {
  /**
   * Exit with an error code when an issue happens during the compilation.
   * Default: true
   */
  strict?: boolean;

  /**
   * Options to pass to gulp-typescript.
   * These are also used when generating tsconfig.json files
   */
  tsOptions: any;
  srcDir: string;
  typeRoots: string[];
  scripts: string[];
  buildDir: string;
}

/**
 * Sources to use when compiling TS code
 */
export interface Sources {
  /**
   * Base directory to use when expanding glob stars.
   */
  baseDir: string;

  /**
   * List of absolute type roots
   */
  typeRoots: string[];

  /**
   * List of absolute patterns for the script files
   */
  scripts: string[];

  /**
   * List of absolute patterns for the sources (script or type definition) files
   */
  sources: string[];
}

export function getSources(options: Options): Sources {
  const result: Sources = {
    baseDir: options.srcDir,
    typeRoots: [],
    scripts: [],
    sources: []
  };

  for (const typeRoot of options.typeRoots) {
    const absPath: string = path.join(options.srcDir, typeRoot);
    result.typeRoots.push(absPath);
    // const relative = path.posix.relative(options.srcDir, absPath);
    if (!/node_modules/.test(typeRoot)) {
      result.sources.push(path.posix.join(absPath, "**/*.d.ts"));
    }
  }

  for (const script of options.scripts) {
    const pattern: Minimatch = new Minimatch(script);
    const glob: string = matcher.asString(matcher.join(options.srcDir, pattern));
    result.scripts.push(glob);
    result.sources.push(glob);
  }

  return result;
}

export function registerTask(gulp: Gulp, targetName: string, options: Options): TaskFunction {
  const sources: Sources = getSources(options);
  const tsOptions: any = assign({}, DEV_TSC_OPTIONS, options.tsOptions);

  const task: TaskFunction = function () {
    // tslint:disable-next-line:typedef
    const tsResult = gulp
      .src(sources.sources, {base: sources.baseDir})
      .pipe(gulpSourceMaps.init())
      .pipe(gulpTypescript(tsOptions));

    return merge([
      tsResult.dts
        .pipe(gulp.dest(options.buildDir)),
      tsResult.js
        .pipe(gulpSourceMaps.write())
        .pipe(gulp.dest(options.buildDir))
    ]);
  };

  gulp.task(`${targetName}:build:scripts`, task);

  return task;
}

export default registerTask;
