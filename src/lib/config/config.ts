/**
 * Project-wide options.
 * These affect all the targets.
 * It defines the main structure of the project.
 */
export interface ProjectOptions {
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
    package: string;

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
}

/**
 * A target represents a group of tasks to produce a specific build.
 */
export interface Target {
  /**
   * Type of the target.
   *
   * "node" represents a node library or server.
   * "angular" represents a client build for angular.
   */
    type: "node" | "test" | "angular";

  /**
   * Base directory for the target, relative to `project.srcDir`.
   * This is only used when generating some target specific configuration files.
   */
  baseDir: string;

  /**
   * List of minimatch glob patterns matching the Typescript scripts, relative
   * to `project.srcDir`.
   */
  scripts: string[];

  /**
   * List of directories where Typescript should search for declarations,
   * relative to `project.srcDir`.
   */
  typeRoots: string[];

  /**
   * The name of tha main module (name of the file without the extension),
   * relative to `project.srcDir`.
   */
  mainModule?: string;
}

/**
 * Represents a build to run tests with Mocha.
 */
export interface NodeTarget extends Target {
  type: "node";

  /**
   * The main module to call when starting the script.
   *
   * TODO: null if there is no main module.
   */
  mainModule: string;
}

export interface TestTarget extends Target {
  type: "test";
}

export interface AngularTarget extends Target {
  type: "angular";

  /**
   * Directory to store intermediate files during the build, relative to
   * `project.buildDir`.
   */
  tmpDir: string;

  /**
   * Directory containing static assets, .pug and .scss will be compiled,
   * relative to `project.srcDir`.
   */
  assetsDir: string;

  /**
   * Entry point of the application.
   */
  mainModule: string;
}

/**
 * Preconfigured "node" configuration to develop a node library.
 * It uses Typescript and Typings.
 */
export const LIB_TARGET: NodeTarget = {
  type: "node",
  baseDir: "lib",
  scripts: ["lib/**/*.ts", "!**/*.spec.ts"],
  typeRoots: ["../typings/globals", "../typings/modules", "../node_modules/@types"],
  mainModule: "index"
};

/**
 * Preconfigured "test" configuration to test a node library.
 * It uses Typescript, Typings and Mocha.
 */
export const LIB_TEST_TARGET: TestTarget = {
  type: "test",
  baseDir: "test",
  scripts: ["test/**/*.ts", "lib/**/*.ts"],
  typeRoots: ["../typings/globals", "../typings/modules", "../node_modules/@types"],
  mainModule: "index"
};

/**
 * Preconfigured project configuration.
 * It uses process.cwd() as the root and assumes a standard project structure.
 */
export const DEFAULT_PROJECT_OPTIONS: ProjectOptions = {
  root: process.cwd(),
  package: "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src"
};
