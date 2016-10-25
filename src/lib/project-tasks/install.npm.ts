import * as install from "gulp-install";

import {ProjectOptions} from "../config/config";

export const taskName = "install:npm";

export interface Options {
  project: ProjectOptions;
}

export function registerTask (gulp: any, {project}: Options) {
  gulp.task(taskName, function () {
    return gulp.src([project.package])
      .pipe(install());
  });
}

export default registerTask;
