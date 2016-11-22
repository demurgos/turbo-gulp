import {bumpVersion} from "../utils/project";
import {ProjectOptions} from "../config/config";
import {Gulp} from "gulp";

export const taskName = ":bump-minor";

export interface Options {
  project: ProjectOptions;
}

export function registerTask(gulp: Gulp, {project}: Options): void {
  gulp.task(taskName, function () {
    bumpVersion("minor", project);
  });
}

export default registerTask;
