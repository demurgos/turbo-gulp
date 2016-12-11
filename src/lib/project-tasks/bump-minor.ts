import {Gulp} from "gulp";
import {ProjectOptions} from "../config/config";
import {bumpVersion} from "../utils/project";

export const taskName: string = ":bump-minor";

export interface Options {
  project: ProjectOptions;
}

export function registerTask(gulp: Gulp, {project}: Options): void {
  gulp.task(taskName, function () {
    bumpVersion("minor", project);
  });
}

export default registerTask;
