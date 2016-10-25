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
  type: "node" | "test" | "browser";

  /**
   * Base directory for the sources of the target, relative to `project.srcDir`.
   */
  baseDir: string;

  /**
   * List of minimatch glob patterns matching the Typescript scripts, relative to `baseDir`.
   */
  scripts: string[];

  /**
   * List of minimatch glob patterns matching the Typescript declarations, relative to `baseDir`.
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
  scripts: ["**/*.ts", "!**/*.spec.ts"],
  declarations: ["../typings/**/*.d.ts"],
  mainModule: "index"
};

export const LIB_TEST_TARGET: TestTarget = {
  type: "test",
  baseDir: "test",
  scripts: ["**/*.ts", "../lib/**/*.ts"],
  declarations: ["../typings/**/*.d.ts"],
  mainModule: "index"
};

export const DEFAULT_CONFIG: ProjectOptions = {
  root: process.cwd(),
  "package": "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src"
};
