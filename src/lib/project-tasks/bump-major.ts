/**
 * This module defines the `bump-major` project task.
 *
 * @module project-tasks/bump-major
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import Undertaker from "undertaker";
import { Project } from "../project";
import { bumpVersion } from "../utils/project";

export const taskName: string = "bump-major";

export function registerTask(taker: Undertaker, project: Project): void {
  taker.task(taskName, async function (): Promise<void> {
    return bumpVersion("major", project);
  });
}
