import { FSWatcher } from "fs";
import { Gulp } from "gulp";
import * as gulpRename from "gulp-rename";
import * as gulpSourceMaps from "gulp-sourcemaps";
import * as gulpTypescript from "gulp-typescript";
import * as merge from "merge2";
import { CompilerOptionsJson } from "../options/tsc";
import { OutModules } from "../options/typescript";
import { TaskFunction } from "../utils/gulp-task-function";
import { deleteUndefinedProperties } from "../utils/utils";
import { ResolvedTsLocations, resolveTsLocations, TypescriptConfig } from "./_typescript";

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

    if (options.outModules === OutModules.Js) {
      const compiledStream: CompiledStream = srcStream.pipe(gulpTypescript(tscOptions));
      jsStream = compiledStream.js.pipe(gulpSourceMaps.write());
      dtsStream = compiledStream.dts;
    } else { // Mjs or Both
      const compiledStream: CompiledStream = srcStream.pipe(gulpTypescript({...tscOptions, module: "es2015"}));
      mjsStream = compiledStream.js.pipe(gulpRename({extname: ".mjs"})).pipe(gulpSourceMaps.write());
      dtsStream = compiledStream.dts;
      if (options.outModules === OutModules.Both) {
        jsStream = srcStream.pipe(gulpTypescript(tscOptions)).js.pipe(gulpSourceMaps.write());
      }
    }

    return merge([dtsStream, jsStream, mjsStream].filter(x => x !== undefined))
      .pipe(gulp.dest(options.buildDir));
  };
  task.displayName = "_build:scripts";
  return task;
}

export function getBuildTypescriptWatcher(gulp: Gulp, options: TypescriptConfig): FSWatcher {
  const buildTask: TaskFunction = getBuildTypescriptTask(gulp, options);
  const resolved: ResolvedTsLocations = resolveTsLocations(options);
  return gulp.watch(resolved.absScripts, {cwd: options.srcDir}, buildTask) as FSWatcher;
}
