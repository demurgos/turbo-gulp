import {Gulp} from "gulp";
import {ProjectOptions} from "../config/config";
import {bumpVersion} from "../utils/project";

export const taskName: string = ":bump-minor";

export function registerTask(gulp: Gulp, project: ProjectOptions): void {
  gulp.task(taskName, function (): Promise<void> {
    return bumpVersion("minor", project);
  });
}

export default registerTask;
