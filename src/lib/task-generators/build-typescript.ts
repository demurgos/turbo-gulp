import {resolve as resolvePath} from "path";
import {assign} from "lodash";
import tsc = require("gulp-typescript");
import merge = require("merge2");
import {Gulp} from "gulp";

import {DEV_TSC_OPTIONS} from "../config/tsc";

export interface Options {
  tsOptions: any;
  srcDir: string;
  sources: string[];
  buildDir: string;
}

export function registerTask (gulp: Gulp, targetName: string, options: Options) {
  const tsOptions = assign({}, DEV_TSC_OPTIONS, options.tsOptions);

  const task = function () {
    const tsResult = gulp
      .src(options.sources.map(source => resolvePath(options.srcDir, source)), {base: options.srcDir})
      .pipe(tsc(tsOptions));

    return merge([
      tsResult.dts.pipe(gulp.dest(options.buildDir)),
      tsResult.js.pipe(gulp.dest(options.buildDir))
    ]);
  };

  gulp.task(`build:${targetName}:scripts`, task);

  return task;
}

export default registerTask;
