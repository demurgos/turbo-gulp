import * as path from "path";
import {assign} from "lodash";
import gulpTypescript = require("gulp-typescript");
import merge = require("merge2");
import gulpSourceMaps = require("gulp-sourcemaps");
import {Gulp} from "gulp";
import {Minimatch} from "minimatch";

import {DEV_TSC_OPTIONS} from "../config/tsc";
import * as matcher from "../utils/matcher";

export interface Options {
  tsOptions: any;
  srcDir: string;
  typeRoots: string[];
  scripts: string[];
  buildDir: string;
}

export interface Sources {
  baseDir: string;
  typeRoots: string[];
  scripts: string[];
  sources: string[];
}

export function getSources (options: Options): Sources {
  const result: Sources = {
    baseDir: options.srcDir,
    typeRoots: [],
    scripts: [],
    sources: []
  };

  for (const typeRoot of options.typeRoots) {
    const absPath = path.join(options.srcDir, typeRoot);
    result.typeRoots.push(absPath);
    // const relative = path.posix.relative(options.srcDir, absPath);
    if (!/node_modules/.test(typeRoot)) {
      result.sources.push(path.posix.join(absPath, "**/*.d.ts"));
    }
  }

  for (const script of options.scripts) {
    const pattern: Minimatch = new Minimatch(script);
    const glob = matcher.asString(matcher.join(options.srcDir, pattern));
    result.scripts.push(glob);
    result.sources.push(glob);
  }

  return result;
}

export function registerTask (gulp: Gulp, targetName: string, options: Options) {
  const sources = getSources(options);
  const tsOptions: any = assign({}, DEV_TSC_OPTIONS, options.tsOptions);

  // console.log(sources);

  const task = function () {
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
