import {bumpVersion} from "../utils/project";
import {ProjectOptions} from "../config/config";
import {Gulp} from "gulp";

export const taskName = "project:bump-patch";

export interface Options {
  project: ProjectOptions;
}

export function registerTask (gulp: Gulp, {project}: Options): void {
  gulp.task(taskName, function(){
    bumpVersion("patch", project);
  });
}

export default registerTask;
