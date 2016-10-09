import * as Bluebird from "bluebird";
import Locations from "../config/locations";
export declare function ensureUnusedTag(tag: string): Bluebird<void>;
export declare function getVersionTag(version: string): string;
export declare function getVersionMessage(version: string): string;
export declare function commitVersion(version: string, projectRoot?: string): Bluebird<Buffer>;
export declare function release(version: string, locations: Locations): Bluebird<Buffer>;
export interface IPackageJson {
    version: string;
}
export declare function readPackage(locations: Locations): Bluebird<IPackageJson>;
export declare function writePackage(pkg: IPackageJson, locations: Locations): Bluebird<any>;
export declare function setPackageVersion(version: string, locations: Locations): Bluebird<any>;
export declare function getNextVersion(bumpKind: "major" | "minor" | "patch", locations: Locations): Bluebird<string>;
export declare function bumpVersion(bumpKind: "major" | "minor" | "patch", locations: Locations): Bluebird<any>;
