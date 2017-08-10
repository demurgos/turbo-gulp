import {TslintOptions} from "./options/tslint";
import {DEFAULT_PROJECT_TS_OPTIONS, TypescriptOptions} from "./options/typescript";

/**
 * Project-wide webpackOptions.
 * These affect all the targets.
 * It defines the main structure of the project.
 */
export interface Project {
  /**
   * The root directory of the project.
   * This corresponds usually to the repo of the repo.
   *
   * This should be the only absolute path in the configuration.
   */
  root: string;

  /**
   * Path to the `package.json` file, relative to `root`.
   */
  packageJson: string;

  /**
   * Path to the build directory relative to `root`. This is the directory where all of the builds
   * will be placed.
   */
  buildDir: string;

  /**
   * Path to the dist directory relative to `root`.
   * This is the directory where files ready for distribution are placed.
   */
  distDir: string;

  /**
   * Path the source directory relative to `root`.
   * This is the directory where all of the source files and assets are located.
   */
  srcDir: string;

  /**
   * Tslint options
   */
  tslint?: TslintOptions;

  /**
   * Typescript options, targets inherit these options.
   * See the merge rules to see how the target options are merged with the project options.
   */
  typescript?: TypescriptOptions;
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
