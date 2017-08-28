import { FSWatcher } from "fs";
import { Gulp } from "gulp";
import * as gulpSourceMaps from "gulp-sourcemaps";
import * as gulpTypescript from "gulp-typescript";
import * as gulpUtil from "gulp-util";
import * as merge from "merge2";
import { IMinimatch, Minimatch } from "minimatch";
import * as path from "path";
import * as ts from "typescript";
import { CompilerOptionsJson, DEV_TSC_OPTIONS } from "../options/tsc";
import { TypescriptOptions } from "../options/typescript";
import { TaskFunction } from "../utils/gulp-task-function";
import * as matcher from "../utils/matcher";

/**
 * Typescript options for a specific target.
 */
export interface Options extends TypescriptOptions {
  /**
   * Base directory when resolving scripts (absolute path to `project.src`)
   */
  srcDir: string;

  /**
   * Directories where to search for type definitions.
   *
   * Relative to `target.typescript.srcDir`.
   */
  typeRoots: string[];

  /**
   * List of patterns to match the typescript files.
   *
   * The patterns path patterns are relative to `target.typescript.srcDir`.
   */
  scripts: string[];

  /**
   * Absolute path to the output directory
   */
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
    sources: [],
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
    const pattern: IMinimatch = new Minimatch(script);
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
  error(error: gulpTypescript.reporter.TypeScriptError, typescript: typeof ts): void;

  finish(results: gulpTypescript.reporter.CompilationResult): void;
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
            Error("Typescript: Compilation with `strict` option emitted some errors. See report for details"),
          );
        }
      },
    };
  }

  return reporter;
}

function deleteUndefinedProperties(obj: any): void {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
}

export function generateTask(gulp: Gulp, options: Options): TaskFunction {
  const sources: Sources = getSources(options);
  const compilerOptions: CompilerOptionsJson = {...DEV_TSC_OPTIONS, ...options.compilerOptions};
  deleteUndefinedProperties(compilerOptions);
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
        .pipe(gulp.dest(options.buildDir)),
    ]);
  };
  task.displayName = "_build:scripts";
  return task;
}

export function watch(gulp: Gulp, options: Options): FSWatcher {
  const buildTask: TaskFunction = generateTask(gulp, {...options, strict: false});
  const sources: Sources = getSources(options);
  return gulp.watch(sources.sources, {cwd: sources.baseDir}, buildTask) as FSWatcher;
}
