import {Gulp} from "gulp";
import {Project} from "../project";
import * as bumpMajor from "./bump-major";
import * as bumpMinor from "./bump-minor";
import * as bumpPatch from "./bump-patch";
import * as lint from "./lint";
import * as lintFix from "./lint-fix";
import * as tsconfigJson from "./tsconfig-json";
import * as tslintJson from "./tslint-json";

export function registerAll(gulp: Gulp, project: Project) {
  bumpMajor.registerTask(gulp, project);
  bumpMinor.registerTask(gulp, project);
  bumpPatch.registerTask(gulp, project);
  lint.registerTask(gulp, project);
  lintFix.registerTask(gulp, project);
  if (project.typescript !== undefined && project.typescript.tsconfigJson !== undefined) {
    tsconfigJson.registerTask(gulp, project);
  }
  tslintJson.registerTask(gulp, project);
}

export {
  bumpMajor,
  bumpMinor,
  bumpPatch,
  lint,
  lintFix,
  tslintJson,
};
