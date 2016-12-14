import Bluebird = require("bluebird");
import * as fs from "fs";
import * as semver from "semver";

import {ProjectOptions} from "../config/config";
import * as git from "./git";
import {readText, writeText} from "./node-async";

export async function assertUnusedTag(tag: string): Promise<void> {
  if (await git.tagExists(tag)) {
    throw new Error("Tag " + tag + " already exists");
  }
}

export function getVersionTag(version: string): string {
  return "v" + version;
}

export function getVersionMessage(version: string): string {
  return "Release v" + version;
}

export async function commitVersion(version: string, projectRoot?: string): Promise<void> {
  let tag: string = getVersionTag(version);
  let message: string = getVersionMessage(version);
  await git.exec("add", ["."]);
  await git.exec("commit", ["-m", message]);
  await git.exec("tag", ["-a", tag, "-m", message]);
}

export async function release(version: string, locations: ProjectOptions): Promise<void> {
  await Promise.all([
    assertUnusedTag(getVersionTag(version)),
    git.assertCleanMaster()
  ]);
  await setPackageVersion(version, locations);
  await commitVersion(version, locations.root);
}

export interface PackageJson {
  version: string;
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  return JSON.parse(await readText(filePath));
}

export function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  return writeText(filePath, JSON.stringify(data, null, 2) + "\n");
}

export function readPackage(locations: ProjectOptions): Promise<PackageJson> {
  return readJsonFile<PackageJson>(locations.package);
}

export function writePackage(pkg: PackageJson, locations: ProjectOptions): Promise<void> {
  return writeJsonFile(locations.package, pkg);
}

export async function setPackageVersion(version: string, locations: ProjectOptions): Promise<void> {
  const packageData: PackageJson = await readPackage(locations);
  packageData.version = version;
  return writePackage(packageData, locations);
}

export async function getNextVersion(bumpKind: "major" | "minor" | "patch",
                                     locations: ProjectOptions): Promise<string> {
  const packageData: PackageJson = await readPackage(locations);
  return semver.inc(packageData.version, bumpKind);
}

export async function bumpVersion(bumpKind: "major" | "minor" | "patch", locations: ProjectOptions): Promise<void> {
  const nextVersion: string = await getNextVersion(bumpKind, locations);
  await release(nextVersion, locations);
}
