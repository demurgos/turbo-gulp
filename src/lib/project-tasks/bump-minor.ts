import { Gulp } from "gulp";
import { Project } from "../project";
import { bumpVersion } from "../utils/project";

export const taskName: string = ":bump-minor";

export function registerTask(gulp: Gulp, project: Project): void {
  gulp.task(taskName, async function (): Promise<void> {
    return bumpVersion("minor", project);
  });
}
