import {Gulp} from "gulp";
import {Project} from "../project";
import {bumpVersion} from "../utils/project";

export const taskName: string = ":bump-major";

export function registerTask(gulp: Gulp, project: Project): void {
  gulp.task(taskName, function (): Promise<void> {
    return bumpVersion("major", project);
  });
}

export default registerTask;
