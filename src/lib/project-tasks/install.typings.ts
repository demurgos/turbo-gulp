import * as typings from "typings-core";
import {ProjectOptions} from "../config/config";
import {Gulp} from "gulp";

export const taskName = ":install:typings";

export interface Options {
  project: ProjectOptions;
}

export function registerTask(gulp: Gulp, {project}: Options) {
  gulp.task(taskName, function () {
    const options = {
      production: false,
      cwd: project.root
    };
    return typings.install(options);
  });
}

export default registerTask;
