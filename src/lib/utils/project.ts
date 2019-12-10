/**
 * Various helpers around `package.json`, versions and tags.
 *
 * @module utils/project
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { PathLike } from "fs";
import { Furi } from "furi";
import semver from "semver";
import { Project, ResolvedProject } from "../project";
import * as git from "./git";
import { readText, writeText } from "./node-async";

/**
 * Throws an error if the provided git tag is already defined.
 *
 * @param tag Tag to check
 * @return Void promise if the tag is unused, otherwise rejected promise.
 */
export async function assertUnusedTag(tag: string): Promise<void> {
  if (await git.tagExists(tag)) {
    throw new Error(`Tag ${tag} already exists`);
  }
}

/**
 * Get the Git tag corresponding to the provided semver version.
 *
 * It prefixes the version with `v`.
 *
 * @param version Semver version used to create the tag.
 * @return Corresponding tag.
 */
export function getVersionTag(version: string): string {
  return `v${version}`;
}

/**
 * Get the commit or tag message corresponding to the release of the provided version.
 *
 * @param version Semver version used to create the tag.
 * @return Corresponding message.
 */
export function getVersionMessage(version: string): string {
  return `Release v${version}`;
}

/**
 * Commit and tag the current changes as a version release.
 *
 * @param version Semver version for the release.
 * @param projectRoot Root of the project, must be inside a git repo. Default: `process.cwd()`.
 * @return Promise resolved once the commit is done.
 */
export async function commitVersion(version: string, projectRoot: Furi): Promise<void> {
  const cwd: string = projectRoot.toSysPath();
  const tag: string = getVersionTag(version);
  const message: string = getVersionMessage(version);
  await git.execGit("add", ["."], {cwd});
  await git.execGit("commit", ["-m", message], {cwd});
  await git.execGit("tag", ["-a", tag, "-m", message], {cwd});
}

/**
 * Updates the version in `package.json` and creates a release commit.
 *
 * Ensures that the `master` Git branch is active without uncommited changes.
 *
 * @param version The new version (semver string)
 * @param locations Project locations object.
 * @return Promise resolved once the release commit is created.
 */
export async function release(version: string, locations: ResolvedProject): Promise<void> {
  await Promise.all([
    assertUnusedTag(getVersionTag(version)),
    git.assertCleanBranch(["master", getVersionTag(version)]),
  ]);
  await setPackageVersion(version, locations);
  await commitVersion(version, locations.absRoot);
}

/**
 * Expected interface of a `package.json` file.
 */
export interface PackageJson {
  version: string;
  main: string;
  types: string;
  module?: string;
  script?: any;
  gitHead?: string;
}

/**
 * Reads a JSON file and returns its parsed content.
 *
 * @param filePath Path of the file to read.
 * @return Promise for the content of the file.
 */
export async function readJsonFile(filePath: PathLike): Promise<any> {
  return JSON.parse(await readText(filePath));
}

/**
 * Writes an object to a JSON file.
 *
 * The JSON file is pretty printed using 2-spaces indentation, new lines at separators
 * and a trailing new line.
 *
 * @param filePath Path of the file to write the object in.
 * @param data Data to write.
 * @return Promise resolved once the data is written.
 */
export async function writeJsonFile(filePath: PathLike, data: any): Promise<void> {
  return writeText(filePath, JSON.stringify(data, null, 2) + "\n");
}

/**
 * Reads the `package.json` file of the project.
 *
 * @param locations Project locations.
 * @return Promise for the `package.json` data.
 */
export async function readPackage(locations: Project): Promise<PackageJson> {
  // TODO: Check interface of the result
  return readJsonFile(locations.packageJson);
}

export async function writePackage(pkg: PackageJson, locations: Project): Promise<void> {
  return writeJsonFile(locations.packageJson, pkg);
}

export async function setPackageVersion(version: string, locations: Project): Promise<void> {
  const packageData: PackageJson = await readPackage(locations);
  packageData.version = version;
  return writePackage(packageData, locations);
}

export async function getNextVersion(
  bumpKind: "major" | "minor" | "patch",
  locations: Project,
): Promise<string> {
  const packageData: PackageJson = await readPackage(locations);
  const result: string | null = semver.inc(packageData.version, bumpKind);
  if (typeof result !== "string") {
    throw new Error("FailedAssertion: Unable to increment package version");
  }
  return result;
}

export async function bumpVersion(bumpKind: "major" | "minor" | "patch", locations: ResolvedProject): Promise<void> {
  const nextVersion: string = await getNextVersion(bumpKind, locations);
  await release(nextVersion, locations);
}
