import {Gulp, TaskFunction} from "gulp";
import gulpTypescript = require("gulp-typescript");
import gulpSourceMaps = require("gulp-sourcemaps");
import merge = require("merge2");
import {posix as path} from "path";

import {ProjectOptions} from "../config/config";
import defaultTslintConfig from "../config/tslint";
import {writeJsonFile} from "../utils/project";

export interface Options {
  project: ProjectOptions;
  tslintJsonPath: string;
}

export function generateTask(gulp: Gulp, options: Options): TaskFunction {
  const tslintJsonPath: string = path.join(options.project.root, "tslint.json");

  return function () {
    return writeJsonFile(tslintJsonPath, defaultTslintConfig);
  };
}

export function getTaskName(): string {
  return `:tslint.json`;
}

export function registerTask(gulp: Gulp, options: Options): TaskFunction {
  const taskName: string = getTaskName();
  const task: TaskFunction = generateTask(gulp, options);
  gulp.task(taskName, task);
  return task;
}

export default registerTask;
