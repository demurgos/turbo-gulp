import {bumpVersion} from "../utils/project";
import {ProjectOptions} from "../config/config";
import {Gulp} from "gulp";

export const taskName = ":bump-major";

export interface Options {
  project: ProjectOptions;
}

export function registerTask (gulp: Gulp, {project}: Options): void {
  gulp.task(taskName, function(){
    bumpVersion("major", project);
  });
}

export default registerTask;
