/**
 * This module generates tasks to eject `tsconfig.json` files.
 *
 * @module target-tasks/tsconfig-json
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Furi, relative as furiRelative } from "furi";
import undertaker from "undertaker";
import { toStandardTscOptions, TscOptions } from "../options/tsc";
import { RelPosixPath } from "../types";
import { ResolvedTsLocations, resolveTsLocations, TypescriptConfig } from "../typescript";
import { writeJsonFile } from "../utils/project";

export function getTsconfigJsonTask(options: TypescriptConfig): undertaker.TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(options);
  let typeRoots: RelPosixPath[] = [];
  if (resolved.typeRoots !== undefined) {
    typeRoots = resolved.typeRoots.map(
      (abs: Furi): RelPosixPath => furiRelative(resolved.tsconfigJsonDir, abs),
    );
  }
  const tscOptions: TscOptions = {
    ...toStandardTscOptions(options.tscOptions),
    rootDir: furiRelative(resolved.tsconfigJsonDir, resolved.rootDir),
    outDir: furiRelative(resolved.tsconfigJsonDir, resolved.outDir),
    typeRoots,
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
