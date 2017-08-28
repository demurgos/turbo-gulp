import { AbsPosixPath } from "../types";
import { SpawnedProcess, SpawnOptions, SpawnResult } from "./node-async";

export async function execGit(cmd: string, args: string[] = [], options?: SpawnOptions): Promise<SpawnResult> {
  return new SpawnedProcess(
    "git",
    [cmd, ...args],
    {stdio: "pipe", ...options},
  ).toPromise();
}

export async function assertCleanBranch(allowedBranches: string[]): Promise<void> {
  let stdout: Buffer;
  stdout = (await execGit("symbolic-ref", ["HEAD"])).stdout;
  let onAllowedBranch: boolean = false;
  for (const branch of allowedBranches) {
    if (stdout.toString("utf8").trim() === `refs/heads/${branch}`) {
      onAllowedBranch = true;
    }
  }
  if (!onAllowedBranch) {
    throw new Error(`HEAD must be on one of the branches: ${JSON.stringify(allowedBranches)}`);
  }
  stdout = (await execGit("status", ["--porcelain"])).stdout;
  if (stdout.toString("utf8").trim().length > 0) {
    throw new Error("Working copy is dirty");
  }
}

/**
 * Get the hash of the HEAD commit.
 *
 * @return The hash of the HEAD commit.
 */
export async function getHeadHash(): Promise<string> {
  return (await execGit("rev-parse", ["--verify", "HEAD"])).stdout.toString("utf8").trim();
}

export async function tagExists(tag: string): Promise<boolean> {
  return (await execGit("tag", ["-l", tag])).stdout.toString("utf8").trim().length > 0;
}

export interface GitCloneOptions {
  branch?: string;
  depth?: number;
  repository: string;
  directory: AbsPosixPath;
}

/**
 * Clone a repository into a new directory
 */
export async function gitClone(options: GitCloneOptions): Promise<void> {
  const args: string[] = [];
  if (options.branch !== undefined) {
    args.push("--branch", options.branch);
  }
  if (options.depth !== undefined) {
    args.push("--depth", options.depth.toString(10));
  }
  args.push(options.repository, options.directory);
  await execGit("clone", args);
}

export interface GitAddOptions {
  paths: string[];
  repository: AbsPosixPath;
}

/**
 * Clone a repository into a new directory
 */
export async function gitAdd(options: GitAddOptions): Promise<void> {
  const args: string[] = ["--", ...options.paths];
  await execGit("add", args, {cwd: options.repository});
}

export interface GitCommitOptions {
  message: string;
  author?: string;
  repository: AbsPosixPath;
}

export async function gitCommit(options: GitCommitOptions): Promise<void> {
  const args: string[] = ["-m", options.message];
  if (options.author !== undefined) {
    args.push("--author", options.author);
  }
  await execGit("commit", args, {cwd: options.repository});
}

export interface GitPushOptions {
  local: AbsPosixPath;
  remote: string;
}

export async function gitPush(options: GitPushOptions): Promise<void> {
  await execGit("push", [options.remote], {cwd: options.local});
  // if (result.stderr.length > 0) {
  //   throw new Incident("GitPush", result.stderr.toString("utf8"));
  // }
}
