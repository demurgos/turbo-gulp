import { Gulp } from "gulp";
import gulpTypedoc from "gulp-typedoc";
import { CompilerOptionsJson } from "../options/tsc";
import { AbsPosixPath } from "../types";
import { TaskFunction } from "../utils/gulp-task-function";
import { deleteUndefinedProperties } from "../utils/utils";
import { ResolvedTsLocations, resolveTsLocations, TypescriptConfig } from "./_typescript";

export interface TypedocOptions {
  dir: AbsPosixPath;
  name: string;
}

export function getTypedocTask(gulp: Gulp, tsConfig: TypescriptConfig, options: TypedocOptions): TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(tsConfig);
  const tscOptions: CompilerOptionsJson = {
    ...tsConfig.tscOptions,
    rootDir: resolved.rootDir,
    outDir: resolved.outDir,
    typeRoots: resolved.typeRoots,
  };
  deleteUndefinedProperties(tscOptions);

  const task: TaskFunction = function () {
    return gulp
      .src(resolved.absScripts, {base: tsConfig.srcDir})
      // TODO(demurgos): Remove cast once rogierschouten/gulp-typedoc#24 is merged
      .pipe(gulpTypedoc(<any> {
        // TypeScript options (see typescript docs)
        module: "commonjs",
        target: "es2017",
        includeDeclarations: false,
        out: options.dir,
        // TypeDoc options (see typedoc docs)
        name: options.name,
        // theme: "/path/to/my/theme",
        plugins: ["external-module-name"],
        ignoreCompilerErrors: false,
        version: true,
      }));
  };
  task.displayName = "_typedoc";
  return task;
}
