import * as path from "path";
import * as _ from "lodash";

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
  main: string;
}

export interface TestTarget extends Target {
  type: "test";
}

export const LIB_TARGET: NodeTarget = {
  type: "node",
  baseDir: "lib",
  scripts: ["**/*.ts", "!**/*.spec.ts"],
  definitions: ["../typings/**/*.d.ts"],
  main: "index"
};

export const LIB_TEST_TARGET: TestTarget = {
  type: "test",
  baseDir: "test",
  scripts: ["**/*.ts", "../lib/**/*.ts"],
  definitions: ["../typings/**/*.d.ts"],
  main: "index"
};

export const DEFAULT_CONFIG: ProjectOptions = {
  root: process.cwd(),
  "package": "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src"
};

export class Config {
  options: ProjectOptions;

  constructor(config: ProjectOptions) {
    this.options = _.merge({}, DEFAULT_CONFIG, config);
  }

  // getTypescriptSources(targetName: string): string[] {
  //   const core = this.config.core;
  //   const target: TargetConfig = this.config.targets[targetName];
  //   return []
  //     .concat( // TODO: handle exclusion
  //       core.definitions.map((definitionPath: string) => path.join(core.base, definitionPath)),
  //       target.definitions.map((sourcePath: string) => path.join(target.base, sourcePath)),
  //       core.typescript.map((definitionPath: string) => path.join(core.base, definitionPath)),
  //       target.typescript.map((sourcePath: string) => path.join(target.base, sourcePath))
  //     )
  //     .map(item => path.join(this.config.project.root, item));
  // }
  //
  // getSourceDirectory(targetName: string): string {
  //   if (!(targetName in this.config.targets)) {
  //     throw new Error(`Unknown target ${targetName}`);
  //   }
  //   const target: TargetConfig = this.config.targets[targetName];
  //   return path.join(this.config.project.root, target.base);
  // }
  //
  // getBuildDirectory(targetName: string): string {
  //   return path.join(this.config.project.root, this.config.project.build, targetName);
  // }
  //
  // getDistDirectory(targetName: string): string {
  //   return path.join(this.config.project.root, this.config.project.dist, targetName);
  // }
}

export default Config;
