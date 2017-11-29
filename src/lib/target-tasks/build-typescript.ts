import { FSWatcher } from "fs";
import { Gulp } from "gulp";
import * as gulpRename from "gulp-rename";
import * as gulpSourceMaps from "gulp-sourcemaps";
import * as gulpTypescript from "gulp-typescript";
import * as merge from "merge2";
import { posix as posixPath } from "path";
import { CompilerOptionsJson } from "../options/tsc";
import { OutModules } from "../options/typescript";
import { TaskFunction } from "../utils/gulp-task-function";
import { deleteUndefinedProperties } from "../utils/utils";
import { ResolvedTsLocations, resolveTsLocations, TypescriptConfig } from "./_typescript";

type TypescriptErrorHash = string;

function hashTypescriptError(error: gulpTypescript.reporter.TypeScriptError): TypescriptErrorHash {
  return JSON.stringify({
    fileName: error.fullFilename,
    code: error.diagnostic.code,
    startPosition: error.startPosition,
    endPosition: error.endPosition,
  });
}

class UniqueReporter implements gulpTypescript.reporter.Reporter {
  private baseReporter: gulpTypescript.reporter.Reporter;
  private reported: Set<TypescriptErrorHash>;

  constructor() {
    this.baseReporter = gulpTypescript.reporter.defaultReporter();
    this.reported = new Set();
  }

  error(error: gulpTypescript.reporter.TypeScriptError, typescript: any): void {
    const hash: TypescriptErrorHash = hashTypescriptError(error);
    if (this.reported.has(hash)) {
      return;
    }
    this.reported.add(hash);
    this.baseReporter.error!(error, typescript);
  }

  finish(compilerResult: gulpTypescript.reporter.CompilationResult): void {
    this.baseReporter.finish!(compilerResult);
    // if (hasError(compilerResult)) {
    //   throw new gulpUtil.PluginError(
    //     "gulp-typescript",
    //     Error("Typescript: Compilation with `strict` option emitted some errors. See report for details"),
    //   );
    // }
  }
}

export function getBuildTypescriptTask(gulp: Gulp, options: TypescriptConfig): TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(options);
  const tscOptions: CompilerOptionsJson = {
    ...options.tscOptions,
    rootDir: resolved.rootDir,
    outDir: resolved.outDir,
    typeRoots: resolved.typeRoots,
  };
  deleteUndefinedProperties(tscOptions);

  const task: TaskFunction = function () {
    let mjsStream: NodeJS.ReadableStream | undefined;
    let jsStream: NodeJS.ReadableStream | undefined;
    let dtsStream: NodeJS.ReadableStream | undefined;

    const srcStream: NodeJS.ReadableStream = gulp
      .src(resolved.absScripts, {base: options.srcDir})
      .pipe(gulpSourceMaps.init());

    interface CompiledStream {
      js: NodeJS.ReadableStream;
      dts: NodeJS.ReadableStream;
    }

    const reporter: UniqueReporter = new UniqueReporter();
    // TODO: update type definitions of `gulp-sourcemaps`
    const writeSourceMapsOptions: gulpSourceMaps.WriteOptions = <any> {
      sourceRoot: (file: any /* VinylFile */): string => {
        return posixPath.relative(posixPath.dirname(file.relative), "");
      },
    };
    if (options.outModules === OutModules.Js) {
      const compiledStream: CompiledStream = srcStream.pipe(gulpTypescript(tscOptions, reporter));
      jsStream = compiledStream.js
        .pipe(gulpSourceMaps.write(writeSourceMapsOptions));
      dtsStream = compiledStream.dts;
    } else { // Mjs or Both
      const mjsOptions: CompilerOptionsJson = {...tscOptions, module: "es2015"};
      const compiledStream: CompiledStream = srcStream.pipe(gulpTypescript(mjsOptions, reporter));
      mjsStream = compiledStream.js
        .pipe(gulpRename({extname: ".mjs"}))
        .pipe(gulpSourceMaps.write(writeSourceMapsOptions));
      dtsStream = compiledStream.dts;
      if (options.outModules === OutModules.Both) {
        jsStream = srcStream
          .pipe(gulpTypescript(tscOptions, reporter))
          .js
          .pipe(gulpSourceMaps.write(writeSourceMapsOptions));
      }
    }

    return merge([dtsStream, jsStream, mjsStream].filter(x => x !== undefined))
      .pipe(gulp.dest(options.buildDir));
  };
  task.displayName = "_build:scripts";
  return task;
}

export function getBuildTypescriptWatchTask(gulp: Gulp, options: TypescriptConfig): () => FSWatcher {
  return (): FSWatcher => {
    const buildTask: TaskFunction = getBuildTypescriptTask(gulp, options);
    const resolved: ResolvedTsLocations = resolveTsLocations(options);
    return gulp.watch(resolved.absScripts, {cwd: options.srcDir}, buildTask) as FSWatcher;
  };
}

export function getBuildTypescriptWatcher(gulp: Gulp, options: TypescriptConfig): FSWatcher {
  return getBuildTypescriptWatchTask(gulp, options)();
}
