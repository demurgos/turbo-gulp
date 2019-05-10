/**
 * This module re-exports all the project tasks and provides a function to
 * register all the tasks at once.
 *
 * @module project-tasks/index
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import Undertaker from "undertaker";
import { Project } from "../project";
import * as bumpMajor from "./bump-major";
import * as bumpMinor from "./bump-minor";
import * as bumpPatch from "./bump-patch";
import * as lintFix from "./format";
import * as lint from "./lint";
import * as tsconfigJson from "./tsconfig-json";
import * as tslintJson from "./tslint-json";

export function registerAll(taker: Undertaker, project: Project) {
  bumpMajor.registerTask(taker, project);
  bumpMinor.registerTask(taker, project);
  bumpPatch.registerTask(taker, project);
  lint.registerTask(taker, project);
  lintFix.registerTask(taker, project);
  if (project.typescript !== undefined && project.typescript.tsconfigJson !== undefined) {
    tsconfigJson.registerTask(taker, project);
  }
  tslintJson.registerTask(taker, project);
}

export {
  bumpMajor,
  bumpMinor,
  bumpPatch,
  lint,
  lintFix,
  tslintJson,
};
