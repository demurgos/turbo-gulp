import * as bumpMajor from "./bump-major";
import * as bumpMinor from "./bump-minor";
import * as bumpPatch from "./bump-patch";
import * as install from "./install";
import * as installNpm from "./install.npm";
import * as installTypings from "./install.typings";
import * as lint from "./lint";
import {Gulp} from "gulp";

export interface Options extends
  bumpMajor.Options,
  bumpMinor.Options,
  bumpPatch.Options,
  install.Options,
  lint.Options {}

export function registerAll (gulp: Gulp, options: Options) {
  bumpMajor.registerTask(gulp, options);
  bumpMinor.registerTask(gulp, options);
  bumpPatch.registerTask(gulp, options);
  install.registerTask(gulp, options);
  lint.registerTask(gulp, options);
}

export {bumpMajor, bumpMinor, bumpPatch, install, installNpm, installTypings, lint};
