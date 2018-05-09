import Undertaker from "undertaker";
import { Project } from "../project";
import { bumpVersion } from "../utils/project";

export const taskName: string = ":bump-patch";

export function registerTask(taker: Undertaker, project: Project): void {
  taker.task(taskName, async function (): Promise<void> {
    return bumpVersion("patch", project);
  });
}
