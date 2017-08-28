import webpack = require("webpack");
import {CleanOptions} from "./options/clean";
import {CopyOptions} from "./options/copy";
import {PugOptions} from "./options/pug";
import {SassOptions} from "./options/sass";
import {TypescriptOptions} from "./options/typescript";

/**
 * A target represents a group of tasks to produce a specific build.
 */
export interface Target {
  /**
   * Name of the target, used to prefix related tasks
   */
  name: string;

  /**
   * Name of the target directory, relative to `project.buildDir`.
   * Default: `target.name`.
   */
  targetDir?: string;

  /**
   * Source directory for this target, relative to `project.srcDir`.
   */
  srcDir?: string;

  /**
   * List of minimatch glob patterns matching the Typescript scripts, relative
   * to `target.srcDir`.
   */
  scripts: string[];

  /**
   * List of directories where Typescript should search for declarations,
   * relative to `target.srcDir`.
   */
  typeRoots: string[];

  /**
   * Advanced typescript configuration
   */
  typescript?: TypescriptOptions;

  /**
   * A list of copy operations to perform during the build process.
   */
  copy?: CopyOptions[];

  pug?: PugOptions[];

  sass?: SassOptions[];

  /**
   * Description of the files to clean, **relative to `project.root`**.
   *
   * Default:
   * {
   *   dirs: [
   *     path.join(project.buildDir, target.targetDir),
   *     path.join(project.distDir, target.targetDir)
   *   ]
   * }
   */
  clean?: CleanOptions;
}

export interface WebpackTarget extends Target {
  /**
   * Directory to store webpack files during the build, relative to
   * `project.buildDir`.
   */
  webpackDir: string;

  /**
   * The name of tha main module (name of the file without the extension),
   * relative to `project.srcDir`. It is the entry point of the application.
   */
  mainModule: string;

  webpackOptions?: {
    webpack?: typeof webpack;
    configuration?: webpack.Configuration;
  };
}

/**
 * Preconfigured "webpack" configuration for an Angular Universal client.
 */
export const ANGULAR_CLIENT_TARGET: WebpackTarget = {
  name: "client",
  targetDir: "server/static",
  webpackDir: "client.webpack",
  scripts: ["client/**/*.ts", "app/**/*.ts", "lib/**/*.ts", "!**/*.spec.ts"],
  typeRoots: ["custom-typings", "../typings/globals", "../typings/modules", "../node_modules/@types"],
  mainModule: "client/main",
  pug: [{name: "app", src: "app", dest: "app"}],
  sass: [{name: "app", src: "app", dest: "app"}],
  typescript: {
    tsconfigJson: ["client/tsconfig.json"],
  },
  clean: {
    dirs: [
      "build/client.webpack",
    ],
    files: [
      "build/server/static/main.js",
      "dist/server/static/main.js",
    ],
  },
};
