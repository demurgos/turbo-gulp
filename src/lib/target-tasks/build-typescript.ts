/**
 * This module generates Typescript compilation tasks.
 *
 * @module target-tasks/build-typescript
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import fs from "fs";
import globWatcher from "glob-watcher";
import gulpRename from "gulp-rename";
import gulpSourceMaps from "gulp-sourcemaps";
import gulpTypescript from "gulp-typescript";
import { Incident } from "incident";
import merge from "merge2";
import path from "path";
import { Tagged } from "ts-tagged";
import { TaskFunction } from "undertaker";
import vinylFs from "vinyl-fs";
import { CustomTscOptions, toStandardTscOptions, TscOptions } from "../options/tsc";
import { ResolvedTsLocations, resolveTsLocations, TypescriptConfig } from "../typescript";

type TypescriptErrorHash = Tagged<string, "TypescriptErrorHash">;

function hashTypescriptError(error: gulpTypescript.reporter.TypeScriptError): TypescriptErrorHash {
  return JSON.stringify({
    fileName: error.fullFilename,
    code: error.diagnostic.code,
    startPosition: error.startPosition,
    endPosition: error.endPosition,
  });
}

class TypescriptReporter implements gulpTypescript.reporter.Reporter {
  readonly throwOnError: boolean;
  private readonly baseReporter: gulpTypescript.reporter.Reporter;
  private readonly reported: Set<TypescriptErrorHash>;

  constructor(throwOnError: boolean) {
    this.baseReporter = gulpTypescript.reporter.defaultReporter();
    this.reported = new Set();
    this.throwOnError = throwOnError;
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
    if (this.throwOnError && this.reported.size > 0) {
      throw Incident("TypescriptError");
    }
  }
}

export function getBuildTypescriptTask(
  options: TypescriptConfig,
  throwOnError: boolean = true,
): TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(options);
  const customTscOptions: CustomTscOptions = {
    ...options.tscOptions,
    rootDir: resolved.rootDir,
    outDir: resolved.outDir,
    typeRoots: resolved.typeRoots,
  };

  const task: TaskFunction = function () {
    let mjsStream: NodeJS.ReadableStream | undefined;
    let jsStream: NodeJS.ReadableStream | undefined;
    let dtsStream: NodeJS.ReadableStream | undefined;

    const srcStream: NodeJS.ReadableStream = vinylFs
      .src(resolved.absScripts, {base: options.srcDir})
      .pipe(gulpSourceMaps.init());

    interface CompiledStream {
      js: NodeJS.ReadableStream;
      dts: NodeJS.ReadableStream;
    }

    const reporter: TypescriptReporter = new TypescriptReporter(throwOnError);
    // TODO: update type definitions of `gulp-sourcemaps`
    const writeSourceMapsOptions: gulpSourceMaps.WriteOptions = <any> {
      sourceRoot: (file: any /* VinylFile */): string => {
        return path.posix.relative(path.posix.dirname(file.relative), "");
      },
    };
    if (customTscOptions.mjsModule === undefined) {
      const tscOptions: TscOptions = toStandardTscOptions(customTscOptions);
      const compiledStream: CompiledStream = srcStream.pipe(gulpTypescript(tscOptions, reporter));
      jsStream = compiledStream.js
        .pipe(gulpSourceMaps.write(writeSourceMapsOptions));
      dtsStream = compiledStream.dts;
    } else { // Mjs or Both
      const tscOptions: TscOptions = toStandardTscOptions(customTscOptions);
      const mjsTscOptions: TscOptions = {...tscOptions, module: customTscOptions.mjsModule};
      const compiledStream: CompiledStream = srcStream.pipe(gulpTypescript(mjsTscOptions, reporter));
      mjsStream = compiledStream.js
        .pipe(gulpSourceMaps.write(writeSourceMapsOptions))
        .pipe(gulpRename({extname: ".mjs"}));
      dtsStream = compiledStream.dts;
      if (tscOptions.module !== undefined) {
        jsStream = srcStream
          .pipe(gulpTypescript(tscOptions, reporter))
          .js
          .pipe(gulpSourceMaps.write(writeSourceMapsOptions));
      }
    }

    return merge([dtsStream, jsStream, mjsStream].filter(x => x !== undefined) as NodeJS.ReadableStream[])
      .pipe(vinylFs.dest(options.buildDir));
  };
  task.displayName = "_build:scripts";
  return task;
}

export function getBuildTypescriptWatchTask(options: TypescriptConfig): () => fs.FSWatcher {
  return (): fs.FSWatcher => {
    const buildTask: TaskFunction = getBuildTypescriptTask(options, false);
    const resolved: ResolvedTsLocations = resolveTsLocations(options);
    return globWatcher(resolved.absScripts, {cwd: options.srcDir}, buildTask) as fs.FSWatcher;
  };
}

export function getBuildTypescriptWatcher(options: TypescriptConfig): fs.FSWatcher {
  return getBuildTypescriptWatchTask(options)();
}
