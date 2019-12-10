/**
 * This module generates tasks to generate Typedoc documentation.
 *
 * @module target-tasks/typedoc
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Furi } from "furi";
import gulpTypedoc from "gulp-typedoc";
import { TaskFunction } from "undertaker";
import vinylFs from "vinyl-fs";
import { ResolvedTsLocations, resolveTsLocations, TypescriptConfig } from "../typescript";

export interface TypedocOptions {
  dir: Furi;
  name: string;
}

export function getTypedocTask(tsConfig: TypescriptConfig, options: TypedocOptions): TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(tsConfig);

  const task: TaskFunction = function () {
    const gulpTypeDocOptions: gulpTypedoc.Options = {
      // TypeScript options (see typescript docs)
      module: "commonjs",
      target: "es2017",
      includeDeclarations: false,
      out: options.dir.toSysPath(),
      // TypeDoc options (see typedoc docs)
      name: options.name,
      // theme: "/path/to/my/theme",
      plugins: ["external-module-name"],
      version: true,
    };
    // TODO: Fix gulp-typedoc types https://github.com/rogierschouten/gulp-typedoc/issues/27
    Object.assign(gulpTypeDocOptions, {
      tsconfig: resolved.tsconfigJson.toSysPath(),
      ignoreCompilerErrors: false,
    });

    return vinylFs
      .src(resolved.absScripts.map(x => x.toMinimatchString()), {base: tsConfig.srcDir.toSysPath()})
      .pipe(gulpTypedoc(gulpTypeDocOptions));
  };
  task.displayName = "_typedoc";
  return task;
}
