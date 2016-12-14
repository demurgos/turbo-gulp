import * as childProcess from "child_process";
import Bluebird = require("bluebird");

type ExecFileAsync = (file: string, args?: string[], options?: any) => Bluebird<any>;
const execFileAsync: ExecFileAsync = Bluebird.promisify(childProcess.execFile);

export function exec(cmd: string, args: string[] = [], options?: any): Bluebird<Buffer> {
  return execFileAsync("git", [cmd, ...args], options);
}

export async function assertCleanMaster(options?: any): Promise<void> {
  let stdout: Buffer;
  stdout = await exec("symbolic-ref", ["HEAD"]);
  if (stdout.toString("utf8").trim() !== "refs/heads/master") {
    throw new Error("Not on master branch");
  }
  stdout = await exec("status", ["--porcelain"]);
  if (stdout.toString("utf8").trim().length) {
    throw new Error("Working copy is dirty");
  }
}

export async function tagExists(tag: string): Promise<boolean> {
  const stdout: Buffer = await exec("tag", ["-l", tag]);
  return stdout.toString("utf8").trim().length > 0;
}
