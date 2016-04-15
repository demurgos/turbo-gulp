import * as Promise from "bluebird";
import Locations from "../config/locations";
export declare function ensureUnusedTag(tag: string): Promise<void>;
export declare function getVersionTag(version: string): string;
export declare function getVersionMessage(version: string): string;
export declare function commitVersion(version: string, projectRoot?: string): Promise<Buffer>;
export declare function release(version: string, locations: Locations): Promise<Buffer>;
export interface IPackageJson {
    version: string;
}
export declare function readPackage(locations: Locations): Promise<IPackageJson>;
export declare function writePackage(pkg: IPackageJson, locations: Locations): Promise<any>;
export declare function setPackageVersion(version: string, locations: Locations): Promise<any>;
export declare function getNextVersion(type: string, locations: Locations): Promise<string>;
