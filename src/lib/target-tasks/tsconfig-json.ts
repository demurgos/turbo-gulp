/**
 * This module generates tasks to eject `tsconfig.json` files.
 *
 * @module target-tasks/tsconfig-json
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { relative as furiRelative } from "furi";
import undertaker from "undertaker";
import { toStandardTscOptions, TscOptions } from "../options/tsc";
import { ResolvedTsLocations, resolveTsLocations, TypescriptConfig } from "../typescript";
import { writeJsonFile } from "../utils/project";

export function getTsconfigJsonTask(options: TypescriptConfig): undertaker.TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(options);
  const tscOptions: TscOptions = {
    ...toStandardTscOptions(options.tscOptions),
    rootDir: furiRelative(resolved.tsconfigJsonDir, resolved.rootDir),
    outDir: furiRelative(resolved.tsconfigJsonDir, resolved.outDir),
  };
  const tsconfigData: any = {
    compilerOptions: tscOptions,
    include: resolved.relInclude,
    exclude: resolved.relExclude,
  };

  const task: undertaker.TaskFunction = async function () {
    return writeJsonFile(resolved.tsconfigJson, tsconfigData);
  };

  task.displayName = "_tsconfig.json";
  return task;
}
