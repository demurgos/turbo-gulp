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
   * This is only used wheb generating some target specific configuration files.
   */
  baseDir: string;

  /**
   * List of minimatch glob patterns matching the Typescript scripts, relative to `project.srcDir`.
   */
  scripts: string[];

  /**
   * List of minimatch glob patterns matching the Typescript declarations, relative to `project.srcDir`.
   */
  declarations: string[];

  /**
   * The name of tha main module (name of the file without the extenstion).
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

export const LIB_TARGET: NodeTarget = {
  type: "node",
  baseDir: "lib",
  scripts: ["lib/**/*.ts", "!**/*.spec.ts"],
  declarations: ["../typings/**/*.d.ts"],
  mainModule: "index"
};

export const LIB_TEST_TARGET: TestTarget = {
  type: "test",
  baseDir: "test",
  scripts: ["test/**/*.ts", "lib/**/*.ts"],
  declarations: ["../typings/**/*.d.ts"],
  mainModule: "index"
};

export const DEFAULT_PROJECT_OPTIONS: ProjectOptions = {
  root: process.cwd(),
  "package": "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src"
};
