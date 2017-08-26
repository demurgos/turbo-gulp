import {AbsPosixPath} from "../types";
import {execFile} from "./node-async";

export interface NpmPublishOptions {
  /**
   * Directory to publish.
   */
  directory: AbsPosixPath;

  /**
   * Tag to use for this publication.
   *
   * Default: `"latest"`.
   */
  tag?: string;

  /**
   * Path to the npm command-line program.
   *
   * Default: `"npm"` (assumes that `npm` is in the `$PATH`)
   */
  command?: string;
}

export interface ResolvedNpmPublishOptions {
  /**
   * Directory to publish.
   */
  directory: AbsPosixPath;

  /**
   * Tag to use for this publication.
   */
  tag: string;

  /**
   * Path to the npm command-line program.
   */
  command: string;
}

function resolveNpmPublishOptions(options: NpmPublishOptions): ResolvedNpmPublishOptions {
  const tag: string = options.tag !== undefined ? options.tag : "latest";
  const command: string = options.command !== undefined ? options.command : "npm";
  return {directory: options.directory, tag, command};
}

export async function npmPublish(options: NpmPublishOptions): Promise<void> {
  const resolved: ResolvedNpmPublishOptions = resolveNpmPublishOptions(options);
  const args: string[] = ["--tag", resolved.tag];
  await execFile(resolved.command, ["publish", ...args], {cwd: resolved.directory});
}
