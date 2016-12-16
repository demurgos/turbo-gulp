import {Gulp, TaskFunction} from "gulp";
import gulpTypescript = require("gulp-typescript");
import gulpSourceMaps = require("gulp-sourcemaps");
import merge = require("merge2");
import {posix as path} from "path";

import {ProjectOptions} from "../config/config";
import defaultTslintConfig from "../config/tslint";
import {writeJsonFile} from "../utils/project";

export function generateTask(gulp: Gulp, project: ProjectOptions): TaskFunction {
  const relativePath: string = project.tslintJson === undefined ? "tslint.json" : project.tslintJson;
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
