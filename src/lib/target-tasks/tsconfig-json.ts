import path from "path";
import undertaker from "undertaker";
import { toStandardTscOptions, TscOptions } from "../options/tsc";
import { AbsPosixPath, RelPosixPath } from "../types";
import { writeJsonFile } from "../utils/project";
import { ResolvedTsLocations, resolveTsLocations, TypescriptConfig } from "./_typescript";

export function getTsconfigJsonTask(options: TypescriptConfig): undertaker.TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(options);
  let typeRoots: RelPosixPath[] = [];
  if (resolved.typeRoots !== undefined) {
    typeRoots = resolved.typeRoots.map(
      (abs: AbsPosixPath): RelPosixPath => path.posix.relative(resolved.tsconfigJsonDir, abs),
    );
  }
  const tscOptions: TscOptions = {
    ...toStandardTscOptions(options.tscOptions),
    rootDir: path.posix.relative(resolved.tsconfigJsonDir, resolved.rootDir),
    outDir: path.posix.relative(resolved.tsconfigJsonDir, resolved.outDir),
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
