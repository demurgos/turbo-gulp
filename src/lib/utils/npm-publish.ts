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

  /**
   * URI of the registry to use.
   *
   * Default: `"registry.npmjs.org/"`
   */
  registry?: string;

  /**
   * Auth token
   */
  authToken?: string;
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

  /**
   * URI of the registry to use.
   */
  registry: string;

  /**
   * Auth token
   */
  authToken?: string;
}

function resolveNpmPublishOptions(options: NpmPublishOptions): ResolvedNpmPublishOptions {
  const tag: string = options.tag !== undefined ? options.tag : "latest";
  const command: string = options.command !== undefined ? options.command : "npm";
  const registry: string = options.registry !== undefined ? options.registry : "registry.npmjs.org/";
  const authToken: string | undefined = options.authToken;
  return {directory: options.directory, tag, command, registry, authToken};
}

export async function npmPublish(options: NpmPublishOptions): Promise<void> {
  const resolved: ResolvedNpmPublishOptions = resolveNpmPublishOptions(options);
  const args: string[] = ["--tag", resolved.tag];
  const env: {[key: string]: string} = {};
  if (resolved.authToken !== undefined) {
    env.NPM_TOKEN = resolved.authToken;
  }
  await execFile(resolved.command, ["publish", ...args], {cwd: resolved.directory, env});
}
