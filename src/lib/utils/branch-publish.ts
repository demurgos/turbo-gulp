/**
 * @module utils/branch-publish
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import del from "del";
import fs from "fs-extra";
import path from "path";
import tmp from "tmp";
import { toPosix } from "../project";
import { AbsPosixPath, OsPath } from "../types";
import { gitAdd, gitClone as gitClone, gitCommit, gitPush } from "./git";

/**
 * Runs `handler` with a temporary directory.
 *
 * The temporary directory is cleaned automatically at the end.
 */
async function withTmpDir(handler: (path: AbsPosixPath) => Promise<void>): Promise<void> {
  return new Promise<void>((resolve, reject): void => {
    tmp.dir({unsafeCleanup: true}, async (err: Error | null, dir: OsPath, done: (cb: any) => void): Promise<void> => {
      if (err !== null) {
        reject(err);
        return;
      }
      try {
        await handler(toPosix(dir) as AbsPosixPath);
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

/**
 * Options for the [[branchPublish]] function.
 */
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

/**
 * Commits a directory as the content of a branch and pushes it to a remote repository.
 *
 * @param options
 * @return Promise resolved once the commit is pushed.
 */
export async function branchPublish(options: BranchPublishOptions): Promise<void> {
  return withTmpDir(async (tmpDirPath: AbsPosixPath): Promise<void> => {
    console.log(`Using temporary directory: ${tmpDirPath}`);
    const localPath: AbsPosixPath = path.posix.join(tmpDirPath, "repo");
    await gitClone({branch: options.branch, depth: 1, repository: options.repository, directory: localPath});
    await del([path.posix.join(localPath, "**", "*"), `!${path.posix.join(localPath, ".git")}`], {force: true});
    await fs.copy(options.dir, localPath);
    await gitAdd({repository: localPath, paths: ["."]});
    await gitCommit({
      repository: localPath,
      message: options.commitMessage,
      author: options.commitAuthor,
    });
    await gitPush({
      local: localPath,
      remote: "origin",
    });
    console.log(`Pushed to: ${options.repository} on branch ${options.branch}`);
  });
}
