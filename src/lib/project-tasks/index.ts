import * as bumpMajor from "./bump-major";
import * as bumpMinor from "./bump-minor";
import * as bumpPatch from "./bump-patch";
import * as install from "./install";
import * as installNpm from "./install.npm";
import * as installTypings from "./install.typings";
import * as lint from "./lint";

export interface Options extends lint.Options {}

export function registerAll (gulp: any, options: Options) {
  lint.registerTask(gulp, options);
  bumpMajor.registerTask(gulp, options);
  bumpMinor.registerTask(gulp, options);
  bumpPatch.registerTask(gulp, options);
}

export {bumpMajor, bumpMinor, bumpPatch, install, installNpm, installTypings, lint};
