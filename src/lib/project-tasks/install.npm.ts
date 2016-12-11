import {Gulp} from "gulp";
import * as install from "gulp-install";
import {ProjectOptions} from "../config/config";

export const taskName: string = ":install:npm";

export interface Options {
  project: ProjectOptions;
}

export function registerTask(gulp: Gulp, {project}: Options) {
  gulp.task(taskName, function () {
    return gulp.src([project.package])
      .pipe(install());
  });
}

export default registerTask;
