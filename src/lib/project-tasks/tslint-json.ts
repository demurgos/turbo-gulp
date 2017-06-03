import {Gulp} from "gulp";
import gulpTypescript = require("gulp-typescript");
import gulpSourceMaps = require("gulp-sourcemaps");
import merge = require("merge2");
import {posix as path} from "path";
import {ProjectOptions} from "../config/config";
import defaultTslintConfig from "../config/tslint";
import {TaskFunction} from "../utils/gulp-task-function";
import {writeJsonFile} from "../utils/project";

export function generateTask(gulp: Gulp, project: ProjectOptions): TaskFunction {
  let relativePath: string;
  if (project.tslint !== undefined && project.tslint.tslintJson !== undefined) {
    relativePath = project.tslint.tslintJson;
  } else {
    relativePath = "tslint.json";
  }
  const absolutePath: string = path.join(project.root, relativePath);

  return function () {
    return writeJsonFile(absolutePath, defaultTslintConfig);
  };
}

export function getTaskName(): string {
  return `:tslint.json`;
}

export function registerTask(gulp: Gulp, project: ProjectOptions): TaskFunction {
  const taskName: string = getTaskName();
  const task: TaskFunction = generateTask(gulp, project);
  gulp.task(taskName, task);
  return task;
}

export default registerTask;
