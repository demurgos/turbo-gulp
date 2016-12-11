import {Gulp, TaskFunction} from "gulp";
import gulpTypescript = require("gulp-typescript");
import gulpSourceMaps = require("gulp-sourcemaps");
import {assign} from "lodash";
import merge = require("merge2");
import {Minimatch} from "minimatch";
import {posix as path} from "path";

import {DEV_TSC_OPTIONS} from "../config/tsc";
import * as matcher from "../utils/matcher";
import {writeJsonFile} from "../utils/project";

export interface Options {
  tsOptions: any;
  srcDir: string;
  typeRoots: string[];
  scripts: string[];
  buildDir: string;
  tsconfigPath: string;
}

export interface TsconfigPaths {
  baseDir: string;
  outdDir: string;
  rootDir: string;
  typeRoots: string[];
  exclude: string[];
  include: string[];
}

export function getTsconfigPaths(options: Options): TsconfigPaths {
  const tsconfigDir: string = path.dirname(options.tsconfigPath);

  const result: TsconfigPaths = {
    baseDir: tsconfigDir,
    outdDir: path.relative(tsconfigDir, options.buildDir),
    rootDir: path.relative(tsconfigDir, options.srcDir),
    typeRoots: [],
    exclude: [],
    include: []
  };

  for (const typeRoot of options.typeRoots) {
    const absPath: string = path.join(options.srcDir, typeRoot);
    const relPath: string = path.relative(tsconfigDir, absPath);
    // TODO: absPath inside projectRoot ? rel : abs
    result.typeRoots.push(relPath);
  }

  for (const script of options.scripts) {
    const pattern: Minimatch = new Minimatch(script);
    const absGlob: Minimatch = matcher.join(options.srcDir, pattern);
    const relGlob: Minimatch = matcher.relative(tsconfigDir, absGlob);
    if (relGlob.negate) {
      result.exclude.push(matcher.asString(relGlob));
    } else {
      result.include.push(matcher.asString(relGlob));
    }
  }

  return result;
}

export function generateTask(gulp: Gulp, targetName: string, options: Options): TaskFunction {
  const tsOptions: any = assign({}, DEV_TSC_OPTIONS, options.tsOptions);

  const paths: TsconfigPaths = getTsconfigPaths(options);

  delete tsOptions.typescript;
  tsOptions.rootDir = paths.rootDir;
  tsOptions.outDir = paths.outdDir;
  tsOptions.typeRoots = paths.typeRoots;

  const tsconfigData: Object = {
    compilerOptions: tsOptions,
    include: paths.include,
    exclude: paths.exclude
  };

  const tsconfigPath: string = path.join(options.tsconfigPath);

  return function () {
    return writeJsonFile(tsconfigPath, tsconfigData);
  };
}

export function getTaskName(targetName: string): string {
  return `${targetName}:tsconfig`;
}

export function registerTask(gulp: Gulp, targetName: string, options: Options): TaskFunction {
  const taskName: string = getTaskName(targetName);
  const task: TaskFunction = generateTask(gulp, taskName, options);
  gulp.task(taskName, task);
  return task;
}

export default registerTask;
