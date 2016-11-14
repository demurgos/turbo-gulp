export interface ProjectOptions {
  root: string;
  "package": string;
  buildDir: string;
  distDir: string;
  srcDir: string;
}

export interface Target {
  /**
   * Type of the target.
   */
  type: "node" | "test" | "angular";

  /**
   * Base directory for the target, relative to `project.srcDir`.
   * This is only used when generating some target specific configuration files.
   */
  baseDir: string;

  /**
   * List of minimatch glob patterns matching the Typescript scripts, relative to `project.srcDir`.
   */
  scripts: string[];

  /**
   * List of directories where Typescript should search for declarations, relative to `project.srcDir`.
   */
  typeRoots: string[];

  /**
   * The name of tha main module (name of the file without the extension), relative to `project.srcDir`.
   */
  mainModule?: string;
}

export interface NodeTarget extends Target {
  type: "node";
  mainModule: string;
}

export interface TestTarget extends Target {
  type: "test";
}

export interface AngularTarget extends Target {
  type: "angular";

  /**
   * Directory to store intermediate files during the build, relative to `project.buildDir`.
   */
  tmpDir: string;

  /**
   * Directory containing static assets, .pug and .scss will be compiled, relative to `project.srcDir`.
   */
  assetsDir: string;

  mainModule: string;
}

export const LIB_TARGET: NodeTarget = {
  type: "node",
  baseDir: "lib",
  scripts: ["lib/**/*.ts", "!**/*.spec.ts"],
  typeRoots: ["../typings/globals", "../typings/modules", "../node_modules/@types"],
  mainModule: "index"
};

export const LIB_TEST_TARGET: TestTarget = {
  type: "test",
  baseDir: "test",
  scripts: ["test/**/*.ts", "lib/**/*.ts"],
  typeRoots: ["../typings/globals", "../typings/modules", "../node_modules/@types"],
  mainModule: "index"
};

export const DEFAULT_PROJECT_OPTIONS: ProjectOptions = {
  root: process.cwd(),
  "package": "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src"
};
