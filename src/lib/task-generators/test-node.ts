import {Gulp} from "gulp";
import {Minimatch} from "minimatch";
import * as matcher from "../utils/matcher";
import gulpMocha = require("gulp-mocha");

export interface Options {
  testDir: string;
}

export interface Sources {
  baseDir: string;
  specs: string[];
}

export function getSources(options: Options): Sources {
  const baseDir = options.testDir;
  const specs = matcher.asString(matcher.join(baseDir, new Minimatch("**/*.spec.js")));

  return {
    baseDir: baseDir,
    specs: [specs]
  };
}

export function generateTask(gulp: Gulp, targetName: string, options: Options): Function {
  const sources = getSources(options);

  return function () {
    return gulp
      .src(sources.specs, {base: sources.baseDir})
      .pipe(gulpMocha({
        reporter: "spec"
      }));
  };
}

export function getTaskName(targetName: string): string {
  return `${targetName}`;
}

export function registerTask(gulp: Gulp, targetName: string, options: Options): Function {
  const taskName: string = getTaskName(targetName);
  const task = generateTask(gulp, taskName, options);
  gulp.task(taskName, task);
  return task;
}

export default registerTask;
