import {Gulp, TaskFunction} from "gulp";
import gulpTypescript = require("gulp-typescript");
import gulpSourceMaps = require("gulp-sourcemaps");
import {assign} from "lodash";
import merge = require("merge2");
import {Minimatch} from "minimatch";
import {posix as path} from "path";
import {CompilerJsonOptions, DEV_TSC_OPTIONS} from "../config/typescript";
import * as buildTypescript from "../task-generators/build-typescript";
import * as matcher from "../utils/matcher";
import {writeJsonFile} from "../utils/project";

export interface Options extends buildTypescript.Options {
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
    include: [],
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
      result.exclude.push(relGlob.pattern);
    } else {
      result.include.push(relGlob.pattern);
    }
  }

  return result;
}

export function generateTask(gulp: Gulp, options: Options): TaskFunction {
  const compilerOptions: CompilerJsonOptions = assign({}, DEV_TSC_OPTIONS, options.compilerOptions);

  const paths: TsconfigPaths = getTsconfigPaths(options);

  compilerOptions.rootDir = paths.rootDir;
  compilerOptions.outDir = paths.outdDir;
  compilerOptions.typeRoots = paths.typeRoots;

  const tsconfigData: Object = {
    compilerOptions: compilerOptions,
    include: paths.include,
    exclude: paths.exclude,
  };

  const tsconfigPath: string = path.join(options.tsconfigPath);

  const task: TaskFunction = function () {
    return writeJsonFile(tsconfigPath, tsconfigData);
  };

  task.displayName = getTaskName();
  return task;
}

export function getTaskName(): string {
  return "_tsconfig.json";
}

export default generateTask;
