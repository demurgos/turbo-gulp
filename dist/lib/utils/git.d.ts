/// <reference types="node" />
import * as Bluebird from "bluebird";
export declare function exec(cmd: string, args?: string[], options?: any): Bluebird<Buffer>;
export declare function ensureCleanMaster(options?: any): Bluebird<any>;
export declare function checkTag(tag: string): Bluebird<boolean>;
