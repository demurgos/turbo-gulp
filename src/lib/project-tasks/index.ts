import {Gulp} from "gulp";
import {ProjectOptions} from "../config/config";
import * as bumpMajor from "./bump-major";
import * as bumpMinor from "./bump-minor";
import * as bumpPatch from "./bump-patch";
import * as lint from "./lint";
import * as lintFix from "./lint-fix";
import * as tslintJson from "./tslint-json";

export function registerAll(gulp: Gulp, project: ProjectOptions) {
  bumpMajor.registerTask(gulp, project);
  bumpMinor.registerTask(gulp, project);
  bumpPatch.registerTask(gulp, project);
  lint.registerTask(gulp, project);
  lintFix.registerTask(gulp, project);
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
