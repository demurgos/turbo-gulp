import {Gulp} from "gulp";
import {ProjectOptions} from "../config/config";
import {bumpVersion} from "../utils/project";

export const taskName: string = ":bump-major";

export function registerTask(gulp: Gulp, project: ProjectOptions): void {
  gulp.task(taskName, function () {
    bumpVersion("major", project);
  });
}

export default registerTask;
