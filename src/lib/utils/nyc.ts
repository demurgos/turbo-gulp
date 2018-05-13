import { Incident } from "incident";
import { toPosix } from "../project";
import { AbsPosixPath } from "../types";
import { SpawnedProcess, SpawnOptions, SpawnResult } from "./node-async";

const NYC_BIN: AbsPosixPath = toPosix(require.resolve("nyc/bin/nyc.js")) as AbsPosixPath;

export async function execNyc(args: string[], options?: SpawnOptions): Promise<SpawnResult> {
  return new SpawnedProcess(
    "node",
    [NYC_BIN, ...args],
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
  await execNyc(["report", ...args]);
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

  const result: SpawnResult = await execNyc(args, {cwd: options.cwd, stdio: "inherit"});
  if (result.exit.type === "code") {
    if (result.exit.code === 0) {
      return;
    }
    throw Incident("CoverageError", {args});
  }
  throw new Incident("UnexpectedExitValue", {exit: result.exit});
}
