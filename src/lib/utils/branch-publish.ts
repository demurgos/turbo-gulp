import * as del from "del";
import { copy } from "fs-extra";
import * as posixPath from "path";
import {dir as tmpDir } from "tmp";
import { toPosix } from "../project";
import { AbsPosixPath } from "../types";
import { gitAdd, gitClone as gitClone, gitCommit, gitPush } from "./git";

/**
 * Run executor inside a tmp directory. Clean the directory once executor is done.
 *
 */
async function withTmpDir(executor: (path: AbsPosixPath) => Promise<void>): Promise<void> {
  return new Promise<void>((resolve, reject): void => {
    tmpDir({unsafeCleanup: true}, async (err: Error | null, path: string, done: (cb: any) => void): Promise<void> => {
      if (err !== null) {
        reject(err);
      }
      try {
        await executor(toPosix(path));
        done(() => {
          resolve();
        });
      } catch (err) {
        done(() => {
          reject(err);
        });
      }
    });
  });
}

export interface BranchPublishOptions {
  /**
   * Directory to publish
   */
  dir: string;

  /**
   * Name of the branch to update.
   */
  branch: string;

  /**
   * Repo where to publish.
   */
  repository: string;

  /**
   * Message to use when commiting changes.
   */
  commitMessage: string;

  /**
   * Overide the default Git `user` config for this commit. Use the format "John Doe <john.doe@example.com>".
   */
  commitAuthor?: string;
}

export async function branchPublish(options: BranchPublishOptions): Promise<void> {
  return withTmpDir(async (tmpDirPath: AbsPosixPath): Promise<void> => {
    console.log(`Using temporary directory: ${tmpDirPath}`);
    await gitClone({branch: options.branch, depth: 1, repository: options.repository, directory: tmpDirPath});
    await del([posixPath.join(tmpDirPath, "**", "*"), `!${posixPath.join(tmpDirPath, ".git")}`], {force: true});
    await copy(options.dir, tmpDirPath);
    await gitAdd({repository: tmpDirPath, paths: ["."]});
    await gitCommit({
      repository: tmpDirPath,
      message: options.commitMessage,
      author: options.commitAuthor,
    });
    await gitPush({
      local: tmpDirPath,
      remote: "origin",
    });
  });
}
