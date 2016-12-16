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
   * GulpPug options
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
   * GulpSass options
   */
  options?: {
    outputStyle?: "compressed" | string;
  };
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

  typescriptOptions?: {
    typescript?: any
  };

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

export interface TestTarget extends Target {
}

export interface AngularTarget extends Target {
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
   * The name of tha main module (name of the file without the extension),
   * relative to `project.srcDir`. It is the entry point of the application.
   */
  mainModule: string;
}

/**
 * Preconfigured "node" configuration to develop a node library.
 * It uses Typescript and Typings.
 */
export const LIB_TARGET: NodeTarget = {
  name: "lib",
  baseDir: "lib",
  scripts: ["lib/**/*.ts", "!**/*.spec.ts"],
  typeRoots: ["../typings/globals", "../typings/modules", "../node_modules/@types"],
  mainModule: "lib/index"
};

/**
 * Preconfigured "test" configuration to test a node library.
 * It uses Typescript, Typings and Mocha.
 */
export const LIB_TEST_TARGET: TestTarget = {
  name: "lib-test",
  baseDir: "test",
  scripts: ["test/**/*.ts", "lib/**/*.ts"],
  typeRoots: ["../typings/globals", "../typings/modules", "../node_modules/@types"]
};

/**
 * Preconfigured "node" configuration for an Angular Universal server.
 */
export const ANGULAR_SERVER_TARGET: NodeTarget = {
  name: "server",
  baseDir: "server",
  scripts: ["server/**/*.ts", "!**/*.spec.ts"],
  typeRoots: ["../typings/globals", "../typings/modules", "../node_modules/@types"],
  mainModule: "server/main",
  pug: [{src: "app", dest: "app"}],
  sass: [{src: "app", dest: "app"}],
  copy: [{src: "static", files: ["**/*"], dest: "static"}]
};

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
