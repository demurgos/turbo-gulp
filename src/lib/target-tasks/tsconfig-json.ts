import {posix as posixPath } from "path";
import { CompilerOptionsJson } from "../options/tsc";
import { AbsPosixPath, RelPosixPath } from "../types";
import { TaskFunction } from "../utils/gulp-task-function";
import { writeJsonFile } from "../utils/project";
import { ResolvedTsLocations, resolveTsLocations, TypescriptConfig } from "./_typescript";

export function getTsconfigJsonTask(options: TypescriptConfig): TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(options);
  let typeRoots: RelPosixPath[] = [];
  if (resolved.typeRoots !== undefined) {
    typeRoots = resolved.typeRoots.map(
      (abs: AbsPosixPath): RelPosixPath => posixPath.relative(resolved.tsconfigJsonDir, abs),
    );
  }
  const tscOptions: CompilerOptionsJson = {
    ...options.tscOptions,
    rootDir: resolved.rootDir,
    outDir: resolved.outDir,
    typeRoots,
  };
  const tsconfigData: any = {
    compilerOptions: tscOptions,
    include: resolved.relInclude,
    exclude: resolved.relExclude,
  };

  const task: TaskFunction = async function () {
    return writeJsonFile(resolved.tsconfigJson, tsconfigData);
  };

  task.displayName = "_tsconfig.json";
  return task;
}
