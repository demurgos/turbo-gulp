import Undertaker from "undertaker";
import { Project } from "../project";
import * as bumpMajor from "./bump-major";
import * as bumpMinor from "./bump-minor";
import * as bumpPatch from "./bump-patch";
import * as lint from "./lint";
import * as lintFix from "./lint-fix";
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
