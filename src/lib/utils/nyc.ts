import { AbsPosixPath } from "../types";
import { SpawnedProcess, SpawnOptions, SpawnResult } from "./node-async";

const nycBin: string = require.resolve("nyc/bin/nyc.js");

export async function execNyc(cmd: string | null, args: string[] = [], options?: SpawnOptions): Promise<SpawnResult> {
  return new SpawnedProcess(
    nycBin,
    cmd === null ? args : [cmd, ...args],
    {stdio: "pipe", ...options},
  ).toPromise();
}

export type NycReporter = "text" | "text-lcov" | "lcovonly" | "html";

export interface ReportOptions {
  tempDirectory: AbsPosixPath;
}

export async function report(options: ReportOptions): Promise<void> {
  const args: string[] = ["--reporter", "lcov"];
  args.push("--temp-directory", options.tempDirectory);
  await execNyc("report", args);
}

export interface RunOptions {
  cwd: AbsPosixPath;
  command: string[];
  reporters: NycReporter[];
  reportDir: AbsPosixPath;
  tempDir: AbsPosixPath;
  include?: string[];
  colors?: boolean;
}

export async function run(options: RunOptions): Promise<void> {
  const args: string[] = [];
  args.push("--cwd", options.cwd);
  for (const reporter of options.reporters) {
    args.push("--reporter", reporter);
  }
  args.push("--report-dir", options.reportDir);
  args.push("--temp-dir", options.tempDir);
  if (options.colors) {
    args.push("--color");
  }
  args.push("--", ...options.command);
  console.log(`<nyc> ${JSON.stringify(args)}`);
  await execNyc(null, args, {cwd: options.cwd, stdio: "inherit"});
}
