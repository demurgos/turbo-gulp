import {assign} from "lodash";
import tsc = require("gulp-typescript");
import merge = require("merge2");

import {DEV_TSC_OPTIONS} from "../config/tsc";

export interface BuildScriptsOptions {
  tscOptions: any;
  baseDir: string;
  sources: string[];
  buildDir: string;
}

export function registerTask (gulp: any, targetName: string, options: BuildScriptsOptions) {
  const tscOptions = assign({}, DEV_TSC_OPTIONS, options.tscOptions);

  const task = function () {
    const tsResult = gulp
      .src(options.sources, {base: options.baseDir})
      .pipe(tsc(tscOptions));

    return merge([
      tsResult.dts.pipe(gulp.dest(options.buildDir)),
      tsResult.js.pipe(gulp.dest(options.buildDir))
    ]);
  };

  gulp.task(`build:${targetName}:scripts`, task);

  return task;
}

export default registerTask;
