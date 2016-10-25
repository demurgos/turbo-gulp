/// <reference types="node" />
import * as Bluebird from "bluebird";
import { ProjectOptions } from "../config/config";
export declare function ensureUnusedTag(tag: string): Bluebird<void>;
export declare function getVersionTag(version: string): string;
export declare function getVersionMessage(version: string): string;
export declare function commitVersion(version: string, projectRoot?: string): Bluebird<Buffer>;
export declare function release(version: string, locations: ProjectOptions): Bluebird<Buffer>;
export interface IPackageJson {
    version: string;
}
export declare function readPackage(locations: ProjectOptions): Bluebird<IPackageJson>;
export declare function writePackage(pkg: IPackageJson, locations: ProjectOptions): Bluebird<any>;
export declare function setPackageVersion(version: string, locations: ProjectOptions): Bluebird<any>;
export declare function getNextVersion(bumpKind: "major" | "minor" | "patch", locations: ProjectOptions): Bluebird<string>;
export declare function bumpVersion(bumpKind: "major" | "minor" | "patch", locations: ProjectOptions): Bluebird<any>;
