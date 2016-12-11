import {Gulp} from "gulp";
import * as typings from "typings-core";

import {ProjectOptions} from "../config/config";

export const taskName: string = ":install:typings";

export interface Options {
  project: ProjectOptions;
}

export function registerTask(gulp: Gulp, {project}: Options) {
  gulp.task(taskName, function () {
    const options: any = {
      production: false,
      cwd: project.root
    };
    return typings.install(options);
  });
}

export default registerTask;
