import {posix as posixPath, resolve as resolveSysPath} from "path";
import {TslintOptions} from "./options/tslint";
import {DEFAULT_PROJECT_TS_OPTIONS, TypescriptOptions} from "./options/typescript";
import {AbsPosixPath, PosixPath, RelPosixPath, SysPath} from "./types";

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
   * This should be the only absolute path in the configuration.
   */
  readonly root: SysPath;

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
   * Tslint options
   */
  readonly tslint?: TslintOptions;

  /**
   * Typescript options, targets inherit these options.
   * See the merge rules to see how the target options are merged with the project options.
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
  readonly absRoot: AbsPosixPath;

  /**
   * Absolute path to the `package.json` file.
   */
  readonly absPackageJson: AbsPosixPath;

  /**
   * Absolute path to the `build` dir, for development builds.
   */
  readonly absBuildDir: AbsPosixPath;

  /**
   * Absolute path to the directory containing distribution-ready files.
   */
  readonly absDistDir: AbsPosixPath;

  /**
   * Absolute path to the sources dir.
   */
  readonly absSrcDir: AbsPosixPath;
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
  typescript: DEFAULT_PROJECT_TS_OPTIONS,
};

/**
 * Normalizes a system-dependent path to a POSIX path.
 *
 * @param path System-dependent path.
 * @return Normalized POSIX path.
 */
export function toPosix(path: SysPath): PosixPath {
  return path.replace(/\\/g, "/");
}

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
  const absRoot: AbsPosixPath = toPosix(resolveSysPath(project.root));
  const absPackageJson: AbsPosixPath = toPosix(resolveSysPath(project.packageJson));
  const absSrcDir: AbsPosixPath = posixPath.join(absRoot, project.srcDir);
  const absBuildDir: AbsPosixPath = posixPath.join(absRoot, project.buildDir);
  const absDistDir: AbsPosixPath = posixPath.join(absRoot, project.distDir);
  return {...project, absRoot, absPackageJson, absSrcDir, absBuildDir, absDistDir};
}

export function registerProjectTasks(): void {

}
