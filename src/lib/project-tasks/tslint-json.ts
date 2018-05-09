import { posix as path } from "path";
import Undertaker from "undertaker";
import { DEFAULT_UNTYPED_TSLINT_CONFIG } from "../options/tslint";
import { Project } from "../project";
import { writeJsonFile } from "../utils/project";

export function generateTask(project: Project): Undertaker.TaskFunction {
  let relativePath: string;
  if (project.tslint !== undefined && project.tslint.tslintJson !== undefined) {
    relativePath = project.tslint.tslintJson;
  } else {
    relativePath = "tslint.json";
  }
  const absolutePath: string = path.join(project.root, relativePath);

  return async function () {
    return writeJsonFile(absolutePath, DEFAULT_UNTYPED_TSLINT_CONFIG);
  };
}

export function getTaskName(): string {
  return ":tslint.json";
}

export function registerTask(taker: Undertaker, project: Project): Undertaker.TaskFunction {
  const taskName: string = getTaskName();
  const task: Undertaker.TaskFunction = generateTask(project);
  taker.task(taskName, task);
  return task;
}
