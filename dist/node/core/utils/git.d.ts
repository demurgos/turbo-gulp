import * as Promise from "bluebird";
export declare function exec(cmd: string, args?: string[], options?: any): Promise<Buffer>;
export declare function ensureCleanMaster(options?: any): Promise<any>;
export declare function checkTag(tag: string): Promise<boolean>;
