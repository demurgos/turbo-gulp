/**
 * This module generates tasks to generate Typedoc documentation.
 *
 * @module target-tasks/typedoc
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import gulpTypedoc from "gulp-typedoc";
import { TaskFunction } from "undertaker";
import vinylFs from "vinyl-fs";
import { AbsPosixPath } from "../types";
import { ResolvedTsLocations, resolveTsLocations, TypescriptConfig } from "../typescript";

export interface TypedocOptions {
  dir: AbsPosixPath;
  name: string;
}

export function getTypedocTask(tsConfig: TypescriptConfig, options: TypedocOptions): TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(tsConfig);

  const task: TaskFunction = function () {
    return vinylFs
      .src(resolved.absScripts, {base: tsConfig.srcDir})
      // TODO(demurgos): Fix gulp typedoc: add missing `tsconfig` key?
      .pipe(gulpTypedoc({
        // TypeScript options (see typescript docs)
        module: "commonjs",
        target: "es2017",
        tsconfig: resolved.tsconfigJson,
        includeDeclarations: false,
        out: options.dir,
        // TypeDoc options (see typedoc docs)
        name: options.name,
        // theme: "/path/to/my/theme",
        plugins: ["external-module-name"],
        ignoreCompilerErrors: false,
        version: true,
      } as any));
  };
  task.displayName = "_typedoc";
  return task;
}
