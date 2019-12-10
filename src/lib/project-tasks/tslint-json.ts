/**
 * This module defines the `tslint-json` project task.
 *
 * @module project-tasks/tslint-json
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Furi, join as furiJoin } from "furi";
import Undertaker from "undertaker";
import { DEFAULT_UNTYPED_TSLINT_CONFIG } from "../options/tslint";
import { ResolvedProject } from "../project";
import { writeJsonFile } from "../utils/project";

export function generateTask(project: ResolvedProject): Undertaker.TaskFunction {
  let relativePath: string;
  if (project.tslint !== undefined && project.tslint.tslintJson !== undefined) {
    relativePath = project.tslint.tslintJson;
  } else {
    relativePath = "tslint.json";
  }
  const absolutePath: Furi = furiJoin(project.absRoot, [relativePath]);

  return async function () {
    return writeJsonFile(absolutePath, DEFAULT_UNTYPED_TSLINT_CONFIG);
  };
}

export function getTaskName(): string {
  return "tslint.json";
}

export function registerTask(taker: Undertaker, project: ResolvedProject): Undertaker.TaskFunction {
  const taskName: string = getTaskName();
  const task: Undertaker.TaskFunction = generateTask(project);
  taker.task(taskName, task);
  return task;
}
