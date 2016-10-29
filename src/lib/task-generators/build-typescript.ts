import {resolve as resolvePath} from "path";
import {assign} from "lodash";
import gulpTypescript = require("gulp-typescript");
import merge = require("merge2");
import gulpSourceMaps = require("gulp-sourcemaps");
import {Gulp} from "gulp";

import {DEV_TSC_OPTIONS} from "../config/tsc";

export interface Options {
  tsOptions: any;
  srcDir: string;
  sources: string[];
  buildDir: string;
}

export function getSources (options: Options): {baseDir: string; patterns: string[]} {
  return {
    baseDir: options.srcDir,
    patterns: options.sources.map(source => resolvePath(options.srcDir, source))
  };
}

export function registerTask (gulp: Gulp, targetName: string, options: Options) {
  const tsOptions = assign({}, DEV_TSC_OPTIONS, options.tsOptions);
  const {patterns, baseDir} = getSources(options);

  const task = function () {
    const tsResult = gulp
      .src(patterns, {base: baseDir})
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

  gulp.task(`build:${targetName}:scripts`, task);

  return task;
}

export default registerTask;
