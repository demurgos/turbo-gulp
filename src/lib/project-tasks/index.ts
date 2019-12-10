/**
 * This module re-exports all the project tasks and provides a function to
 * register all the tasks at once.
 *
 * @module project-tasks/index
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import Undertaker from "undertaker";
import { Project, ResolvedProject, resolveProject } from "../project";
import * as bumpMajor from "./bump-major";
import * as bumpMinor from "./bump-minor";
import * as bumpPatch from "./bump-patch";
import * as lintFix from "./format";
import * as lint from "./lint";
import * as tsconfigJson from "./tsconfig-json";
import * as tslintJson from "./tslint-json";

export function registerAll(taker: Undertaker, project: Project) {
  const resolved: ResolvedProject = resolveProject(project);

  bumpMajor.registerTask(taker, resolved);
  bumpMinor.registerTask(taker, resolved);
  bumpPatch.registerTask(taker, resolved);
  lint.registerTask(taker, resolved);
  lintFix.registerTask(taker, resolved);
  if (resolved.typescript !== undefined && resolved.typescript.tsconfigJson !== undefined) {
    tsconfigJson.registerTask(taker, resolved);
  }
  tslintJson.registerTask(taker, resolved);
}

export {
  bumpMajor,
  bumpMinor,
  bumpPatch,
  lint,
  lintFix,
  tslintJson,
};
