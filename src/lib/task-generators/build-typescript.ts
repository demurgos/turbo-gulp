import {FSWatcher} from "fs";
import {Gulp, TaskFunction} from "gulp";
import gulpSourceMaps = require("gulp-sourcemaps");
import gulpTypescript = require("gulp-typescript");
import * as gulpUtil from "gulp-util";
import {assign} from "lodash";
import merge = require("merge2");
import {Minimatch} from "minimatch";
import * as path from "path";
import * as ts from "typescript";
import {CompilerJsonOptions, DEV_TSC_OPTIONS} from "../config/typescript";
import * as matcher from "../utils/matcher";

export interface Options {
  /**
   * Base directory when resolving scripts
   */
  srcDir: string;

  /**
   * Directories where to search for type definitions
   */
  typeRoots: string[];

  /**
   * List of patterns (relative to srcDir) to match the typescript files
   */
  scripts: string[];

  /**
   * Output directory
   */
  buildDir: string;

  /**
   * Exit with an error code when an issue happens during the compilation.
   * Default: true
   */
  strict?: boolean;

  /**
   * Options to pass to gulp-typescript.
   * These are also used when generating tsconfig.json files
   */
  compilerOptions?: CompilerJsonOptions;

  /**
   * Typescript compiler instance to use
   */
  typescript?: any;
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

function hasError(compilerResult: gulpTypescript.reporter.CompilationResult): boolean {
  return compilerResult.emitSkipped
    || compilerResult.transpileErrors > 0
    || compilerResult.optionsErrors > 0
    || compilerResult.syntaxErrors > 0
    || compilerResult.globalErrors > 0
    || compilerResult.semanticErrors > 0
    || compilerResult.declarationErrors > 0
    || compilerResult.emitErrors > 0;
}

interface CompleteReporter extends gulpTypescript.reporter.Reporter {
  error: (error: gulpTypescript.reporter.TypeScriptError, typescript: typeof ts) => void;
  finish: (results: gulpTypescript.reporter.CompilationResult) => void;
}

function getReporter(strict: boolean = true): CompleteReporter {
  let reporter: CompleteReporter;
  const defaultReporter: CompleteReporter = <CompleteReporter> gulpTypescript.reporter.defaultReporter();

  if (!strict) {
    reporter = defaultReporter;
  } else {
    reporter = {
      error: defaultReporter.error,
      finish: (compilerResult: gulpTypescript.reporter.CompilationResult) => {
        defaultReporter.finish(compilerResult);
        if (hasError(compilerResult)) {
          throw new gulpUtil.PluginError(
            "gulp-typescript",
            Error("Typescript: Compilation with `strict` option emitted some errors. See report for details")
          );
        }
      }
    };
  }

  return reporter;
}

export function generateTask(gulp: Gulp, options: Options): TaskFunction {
  const sources: Sources = getSources(options);
  const compilerOptions: CompilerJsonOptions = assign({}, DEV_TSC_OPTIONS, options.compilerOptions);
  const reporter: CompleteReporter = getReporter(options.strict);

  const task: TaskFunction = function () {
    // tslint:disable-next-line:typedef
    const tsResult = gulp
      .src(sources.sources, {base: sources.baseDir})
      .pipe(gulpSourceMaps.init())
      .pipe(gulpTypescript(compilerOptions, reporter));

    return merge([
      tsResult.dts
        .pipe(gulp.dest(options.buildDir)),
      tsResult.js
        .pipe(gulpSourceMaps.write())
        .pipe(gulp.dest(options.buildDir))
    ]);
  };
  task.displayName = `_build:scripts`;
  return task;
}

export function watch(gulp: Gulp, options: Options): FSWatcher {
  const buildTask: TaskFunction = generateTask(gulp, options);
  const sources: Sources = getSources(options);
  return gulp.watch(sources.sources, {cwd: sources.baseDir}, buildTask);
}

export default generateTask;
