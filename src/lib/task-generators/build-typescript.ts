import {resolve as resolvePath} from "path";
import {assign} from "lodash";
import tsc = require("gulp-typescript");
import merge = require("merge2");

import {DEV_TSC_OPTIONS} from "../config/tsc";

export interface BuildScriptsOptions {
  tsOptions: any;
  baseDir: string;
  sources: string[];
  buildDir: string;
}

export function registerTask (gulp: any, targetName: string, options: BuildScriptsOptions) {
  const tsOptions = assign({}, DEV_TSC_OPTIONS, options.tsOptions);

  const task = function () {
    const tsResult = gulp
      .src(options.sources.map(source => resolvePath(options.baseDir, source)), {base: options.baseDir})
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
