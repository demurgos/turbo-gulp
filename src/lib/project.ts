/**
 * This module defines the general configuration of the project.
 *
 * @module project
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Furi, join as furiJoin } from "furi";
import path from "path";
import { pathToFileURL, URL } from "url";
import { TslintOptions } from "./options/tslint";
import { DEFAULT_TYPESCRIPT_OPTIONS, TypescriptOptions } from "./options/typescript";
import { OsPath, RelPosixPath } from "./types";

/**
 * Project-wide options.
 * These affect all the targets.
 * It defines the main structure of the project.
 */
export interface Project {
  /**
   * The root directory of the project.
   * This corresponds usually to the root of the repository.
   *
   * **This should be the only absolute path in the configuration.**
   */
  readonly root: Furi | OsPath;

  /**
   * Path to the `package.json` file, relative to `root`.
   */
  readonly packageJson: RelPosixPath;

  /**
   * Path to the build directory relative to `root`. This is the directory where all of the builds
   * will be placed.
   */
  readonly buildDir: RelPosixPath;

  /**
   * Path to the dist directory relative to `root`.
   * This is the directory where files ready for distribution are placed.
   */
  readonly distDir: RelPosixPath;

  /**
   * Path the source directory relative to `root`.
   * This is the directory where all of the source files and assets are located.
   */
  readonly srcDir: RelPosixPath;

  /**
   * Tslint options.
   *
   * @default `{tslintJson: "tslint.json"}`
   */
  readonly tslint?: TslintOptions;

  /**
   * Typescript options, targets inherit these options.
   * See the merge rules to see how the target options are merged with the project options.
   *
   * @default [[DEFAULT_PROJECT_TS_OPTIONS]]
   */
  readonly typescript?: TypescriptOptions;
}

/**
 * Project with fully resolved paths.
 */
export interface ResolvedProject extends Project {
  /**
   * Absolute POSIX path for the root directory.
   */
  readonly absRoot: Furi;

  /**
   * Absolute path to the `package.json` file.
   */
  readonly absPackageJson: Furi;

  /**
   * Absolute path to the `build` dir, for development builds.
   */
  readonly absBuildDir: Furi;

  /**
   * Absolute path to the directory containing distribution-ready files.
   */
  readonly absDistDir: Furi;

  /**
   * Absolute path to the sources dir.
   */
  readonly absSrcDir: Furi;
}

/**
 * Preconfigured project configuration.
 * It uses process.cwd() as the root and assumes a standard project structure.
 */
export const DEFAULT_PROJECT: Project = {
  root: process.cwd(),
  packageJson: "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src",
  tslint: {
    tslintJson: "tslint.json",
  },
  typescript: DEFAULT_TYPESCRIPT_OPTIONS,
};

/**
 * Resolve absolute paths for project locations.
 * This creates a shallow copy of the project configuration.
 * If the project was already resolved, it will compute the resolved values again anyway so you it
 * guarantees that the result is coherent.
 *
 * @param project Project configuration.
 * @return Project configuration with resolved paths.
 */
export function resolveProject(project: Project): ResolvedProject {
  const rootUrl: URL = project.root instanceof URL ? project.root : pathToFileURL(path.resolve(project.root));
  const absRoot: Furi = new Furi(rootUrl.toString());
  const absPackageJson: Furi = furiJoin(absRoot, [project.packageJson]);
  const absSrcDir: Furi = furiJoin(absRoot, [project.srcDir]);
  const absBuildDir: Furi = furiJoin(absRoot, [project.buildDir]);
  const absDistDir: Furi = furiJoin(absRoot, [project.distDir]);
  return {...project, absRoot, absPackageJson, absSrcDir, absBuildDir, absDistDir};
}

export function registerProjectTasks(): void {

}
