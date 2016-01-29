import * as fs from "fs";
import * as childProcess from "child_process";

import * as Promise from "bluebird";

let execFileAsync: (file: string, args?: string[], options?: any)=>Promise<any> = Promise.promisify(childProcess.execFile);

export function exec(cmd: string, args?: string[], options?: any): Promise<Buffer>{
  args.unshift(cmd);
  return execFileAsync("git", args, options);
}

export function ensureCleanMaster(options?: any): Promise<void>{
  return exec("symbolic-ref", ["HEAD"])
    .then(function (stdout) {
      if (stdout.toString("utf8").trim() !== "refs/heads/master") {
        throw new Error("Not on master branch");
      }
      return exec("status", ["--porcelain"]);
    })
    .then(function (stdout) {
      if (stdout.toString("utf8").trim().length) {
        throw new Error("Working copy is dirty");
      }
    });
}

// checks if the tag exists
export function checkTag(tag: string): Promise<boolean>{
  return exec("tag", ["-l", tag])
    .then((stdout) => {
      return !!stdout.toString("utf8").trim().length;
    });
}
