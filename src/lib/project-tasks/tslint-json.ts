import {Gulp} from "gulp";
import {posix as path} from "path";
import {DEFAULT_UNTYPED_TSLINT_CONFIG} from "../options/tslint";
import {Project} from "../project";
import {TaskFunction} from "../utils/gulp-task-function";
import {writeJsonFile} from "../utils/project";

export function generateTask(gulp: Gulp, project: Project): TaskFunction {
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
  return `:tslint.json`;
}

export function registerTask(gulp: Gulp, project: Project): TaskFunction {
  const taskName: string = getTaskName();
  const task: TaskFunction = generateTask(gulp, project);
  gulp.task(taskName, task);
  return task;
}

export default registerTask;
