import * as ts from "typescript";
import {Configuration as WebpackConfiguration, Webpack} from "webpack";
import {CompilerJsonOptions} from "./typescript";

/**
 * Project-wide webpackOptions.
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
   * Path to the tslint.json file, relative to `root`
   */
  tslintJson?: string;

  tslintOptions?: {
    configuration?: {
      rules?: {}
    },
    formatter?: "verbose" | string;
    /**
     * The files to lint, relative to `root`
     */
    files?: string[];
    tslint?: any;
  };
}

/**
 * CopyOptions describes a copy operation required to build a target.
 */
export interface CopyOptions {
  /**
   * Base directory of the files to copy. Relative to target.srcDir
   * Default: target.srcDir
   */
  src?: string;

  /**
   * A list of minimatch patterns
   */
  files: string[];

  /**
   * Target directory of the copy, relative to the target output directory.
   * Default: target output directory
   */
  dest?: string;

  /**
   * Name of the copy operation.
   * It will be used for the name of the task: `<targetName>:build:copy:<copyName>`.
   * If youd do not define it, it will be "anonymous" and will only
   * be called by `<targetName>:build:copy`
   */
  name?: string;
}

/**
 * PugOptions describes a pug operation required to build a target.
 */
export interface PugOptions {
  /**
   * Base directory of the files to copy. Relative to srcDir
   * Default: srcDir
   */
  src?: string;

  /**
   * A list of minimatch patterns
   */
  files?: string[];

  /**
   * Target directory of the copy, relative to the target output directory.
   * Default: target.buildDir/targetName output directory
   */
  dest?: string;

  /**
   * Name of the pug operation.
   */
  name?: string;

  /**
   * GulpPug webpackOptions
   */
  options?: {locals?: {}};
}

/**
 * Describes a sass operation required to build a target.
 */
export interface SassOptions {
  /**
   * Base directory of the files to copy. Relative to srcDir
   * Default: srcDir
   */
  src?: string;

  /**
   * A list of minimatch patterns
   */
  files?: string[];

  /**
   * Target directory of the copy, relative to the target output directory.
   * Default: target output directory
   */
  dest?: string;

  /**
   * Name of the sass operation.
   */
  name?: string;

  /**
   * GulpSass webpackOptions
   */
  options?: {
    outputStyle?: "compressed" | string;
  };
}

export interface TypescriptOptions {
  /**
   * Typescript instance to use for compilation.
   */
  typescript?: typeof ts;

  /**
   * Exit with non-null return code on any error
   */
  strict?: boolean;

  /**
   * Override default options
   */
  compilerOptions?: CompilerJsonOptions;
  /**
   * A list of paths where you should generate a `tsconfig.json` file.
   * Relative to `project.src`.
   */
  tsconfigJson: string[];
}

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
   * Advanced typescript configuration
   */
  typescript?: TypescriptOptions;

  /**
   * A list of copy operations to perform during the build process.
   */
  copy?: CopyOptions[];

  pug?: PugOptions[];

  sass?: SassOptions[];
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
    webpack?: Webpack;
    configuration?: WebpackConfiguration;
  };
}

/**
 * Preconfigured project configuration.
 * It uses process.cwd() as the root and assumes a standard project structure.
 */
export const DEFAULT_PROJECT_OPTIONS: ProjectOptions = {
  root: process.cwd(),
  packageJson: "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src"
};

/**
 * Preconfigured "node" configuration to develop a node library.
 * It uses Typescript and Typings.
 */
export const LIB_TARGET: NodeTarget = {
  name: "lib",
  scripts: ["lib/**/*.ts", "!**/*.spec.ts"],
  typeRoots: ["custom-typings", "../typings/globals", "../typings/modules", "../node_modules/@types"],
  mainModule: "lib/index",
  typescript: {
    tsconfigJson: ["lib/tsconfig.json"]
  }
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
    strict: true
  }
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
    tsconfigJson: ["server/tsconfig.json"]
  }
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
    tsconfigJson: ["client/tsconfig.json"]
  }
};
