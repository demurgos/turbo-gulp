import {CompilerOptionsJson} from "../options/tsc";
import {TaskFunction} from "../utils/gulp-task-function";
import {writeJsonFile} from "../utils/project";
import {ResolvedTsLocations, resolveTsLocations, TypescriptConfig} from "./_typescript";

export function getTsconfigJsonTask(options: TypescriptConfig): TaskFunction {
  const resolved: ResolvedTsLocations = resolveTsLocations(options);
  const tscOptions: CompilerOptionsJson = {
    ...options.tscOptions,
    rootDir: resolved.rootDir,
    outDir: resolved.outDir,
    typeRoots: resolved.typeRoots,
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
