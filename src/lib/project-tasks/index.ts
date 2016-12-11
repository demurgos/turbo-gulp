import {Gulp} from "gulp";
import * as bumpMajor from "./bump-major";
import * as bumpMinor from "./bump-minor";
import * as bumpPatch from "./bump-patch";
import * as install from "./install";
import * as installNpm from "./install.npm";
import * as installTypings from "./install.typings";
import * as lint from "./lint";
import * as tslintJson from "./tslint-json";

export interface Options extends bumpMajor.Options,
  bumpMinor.Options,
  bumpPatch.Options,
  install.Options,
  lint.Options,
  tslintJson.Options {}

export function registerAll(gulp: Gulp, options: Options) {
  bumpMajor.registerTask(gulp, options);
  bumpMinor.registerTask(gulp, options);
  bumpPatch.registerTask(gulp, options);
  install.registerTask(gulp, options);
  lint.registerTask(gulp, options);
  tslintJson.registerTask(gulp, options);
}

export {
  bumpMajor,
  bumpMinor,
  bumpPatch,
  install,
  installNpm,
  installTypings,
  lint,
  tslintJson
};
