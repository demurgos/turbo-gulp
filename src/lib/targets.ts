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

/**
 * Represents a build to run tests with Mocha.
 */
export interface NodeTarget extends Target {
  /**
   * The name of tha main module (name of the file without the extension),
   * relative to `project.srcDir`.
   */
  mainModule?: string | null;

  distPackage?: boolean;
}

export interface TestTarget extends NodeTarget {
  mocha?: {
    /**
     * List of files to test, relative to targetDir
     */
    files?: string[];
  };
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
 * Preconfigured "node" configuration to develop a simple node library.
 * It uses Typescript and Typings.
 */
export const LIB_TARGET: NodeTarget = {
  name: "lib",
  srcDir: "./lib",
  scripts: ["**/*.ts"],
  typeRoots: ["../custom-typings", "../../node_modules/@types"],
  mainModule: "index",
  typescript: {
    tsconfigJson: ["tsconfig.json"],
  },
};

/**
 * Preconfigured "test" configuration to test a node library.
 * It uses Typescript, Typings and Mocha.
 */
export const LIB_TEST_TARGET: TestTarget = {
  name: "lib-test",
  scripts: ["test/**/*.ts", "lib/**/*.ts"],
  typeRoots: ["custom-typings", "../typings/globals", "../typings/modules", "../node_modules/@types"],
  typescript: {
    tsconfigJson: ["test/tsconfig.json"],
    strict: true,
  },
};

/**
 * Preconfigured "node" configuration for an Angular Universal server.
 */
export const ANGULAR_SERVER_TARGET: NodeTarget = {
  name: "server",
  scripts: ["server/**/*.ts", "app/**/*.ts", "lib/**/*.ts", "!**/*.spec.ts"],
  typeRoots: ["custom-typings", "../typings/globals", "../typings/modules", "../node_modules/@types"],
  mainModule: "server/main",
  pug: [{name: "app", src: "app", dest: "app"}, {name: "static", src: "static", dest: "static"}],
  sass: [{name: "app", src: "app", dest: "app"}, {name: "static", src: "static", dest: "static"}],
  copy: [{name: "static", src: "static", files: ["**/*", "!**/*.(pug|scss)"], dest: "static"}],
  typescript: {
    tsconfigJson: ["server/tsconfig.json"],
  },
};

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
