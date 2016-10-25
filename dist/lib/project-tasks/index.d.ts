import * as bumpMajor from "./bump-major";
import * as bumpMinor from "./bump-minor";
import * as bumpPatch from "./bump-patch";
import * as install from "./install";
import * as installNpm from "./install.npm";
import * as installTypings from "./install.typings";
import * as lint from "./lint";
export interface Options extends bumpMajor.Options, bumpMinor.Options, bumpPatch.Options, install.Options, lint.Options {
}
export declare function registerAll(gulp: any, options: Options): void;
export { bumpMajor, bumpMinor, bumpPatch, install, installNpm, installTypings, lint };
