/**
 * Helpers to publish packages using the npm CLI.
 *
 * @module utils/npm-publish
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { AbsPosixPath } from "../types";
import { execFile } from "./node-async";

export interface NpmPublishOptions {
  /**
   * Directory to the package to publish.
   *
   * It must contain a `package.json` file.
   */
  directory: AbsPosixPath;

  /**
   * Tag to use for this publication.
   *
   * Default: `"latest"`.
   */
  tag?: string;

  /**
   * Path to the npm or Yarn command-line program.
   *
   * Default: `"npm"` (assumes that `npm` is in the `$PATH`)
   */
  command?: string;
}

export interface ResolvedNpmPublishOptions extends NpmPublishOptions {
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

/**
 * Fully resolves the provided options for [[npmPublish]].
 *
 * It applies default values to ensure that the options are complete.
 *
 * @param options Base options to resolve.
 * @return Resolved options.
 */
function resolveNpmPublishOptions(options: NpmPublishOptions): ResolvedNpmPublishOptions {
  const tag: string = options.tag !== undefined ? options.tag : "latest";
  const command: string = options.command !== undefined ? options.command : "npm";
  return {directory: options.directory, tag, command};
}

/**
 * Publishes a package to the npm registry.
 *
 * @param options Publication options.
 * @return Promise resolved once the package is published.
 */
export async function npmPublish(options: NpmPublishOptions): Promise<void> {
  const resolved: ResolvedNpmPublishOptions = resolveNpmPublishOptions(options);
  const args: string[] = ["--tag", resolved.tag];
  await execFile(resolved.command, ["publish", ...args], {cwd: resolved.directory});
}
