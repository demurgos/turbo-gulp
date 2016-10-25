import {bumpVersion} from "../utils/project";
import {ProjectOptions} from "../config/config";

export const taskName = "project:bump-minor";

export interface Options {
  project: ProjectOptions;
}

export function registerTask (gulp: any, {project}: Options): void {
  gulp.task(taskName, function(){
    bumpVersion("minor", project);
  });
}

export default registerTask;
