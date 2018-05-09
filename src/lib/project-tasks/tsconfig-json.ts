import { posix as posixPath } from "path";
import { default as Undertaker, TaskFunction } from "undertaker";
import { CompilerOptionsJson, DEFAULT_PROJECT_TSC_OPTIONS, mergeTscOptionsJson } from "../options/tsc";
import { Project } from "../project";
import { writeJsonFile } from "../utils/project";

export interface Options {
  /**
   * The absolute path where to generate the project tsconfigJson file.
   */
  readonly tsconfigJson: string;

  /**
   * The compiler options to apply, merged with the default project compiler options.
   */
  readonly compilerOptions?: CompilerOptionsJson;
}

export function generateTask(options: Options): TaskFunction {
  const compilerOptions: CompilerOptionsJson = mergeTscOptionsJson(
    DEFAULT_PROJECT_TSC_OPTIONS,
    options.compilerOptions,
  );

  const task: TaskFunction = async function () {
    return writeJsonFile(options.tsconfigJson, {compilerOptions});
  };

  task.displayName = getTaskName();
  return task;
}

export function getTaskName(): string {
  return ":tsconfig.json";
}

export function registerTask(taker: Undertaker, project: Project): TaskFunction {
  if (project.typescript === undefined || project.typescript.tsconfigJson === undefined) {
    throw new Error("Cannot register project tsconfigJson task, missing required properties options");
  }

  const subTasks: TaskFunction[] = [];

  for (const tsconfigPath of project.typescript.tsconfigJson) {
    const tsconfigJson: string = posixPath.join(project.root, tsconfigPath);
    const compilerOptions: CompilerOptionsJson | undefined = project.typescript.compilerOptions;
    const subTask: TaskFunction = generateTask({tsconfigJson, compilerOptions});
    subTask.displayName = `_tsconfig.json:${tsconfigPath}`;
    subTasks.push(subTask);
  }

  const mainTask: TaskFunction = taker.parallel(...subTasks);
  mainTask.displayName = getTaskName();
  taker.task(mainTask.displayName, mainTask);
  return mainTask;
}
