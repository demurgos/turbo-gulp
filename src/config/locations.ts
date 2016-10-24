import * as path from "path";
import * as _ from "lodash";

export interface TargetConfig{
  base: string;
  typescript: string[];
  definitions: string[];
  main?: string;
}

export interface Config{
  project: {
    root: string,
    "package": string,
    "systemjsConfig": string,
    build: string,
    dist: string,
    coverage: string,
    sources: string
  };
  core: TargetConfig;
  targets: {
    node?: TargetConfig,
    browser?: TargetConfig,
    electron?: TargetConfig
  };
}

export function getDefaultConfig(): Config {
  return {
    project: {
      root: process.cwd(),
      "package": "package.json",
      "systemjsConfig": "systemjs.config.js",
      build: "build",
      dist: "dist",
      coverage: "coverage",
      sources: "src"
    },
    core: {
      base: "src",
      typescript: ["**/*.ts", "!platform/**/*.ts"],
      definitions: ["../typings/**/*.d.ts"]
    },
    targets: {
      node: {
        base: "src/platform/node",
        typescript: ["**/*.ts"],
        main: "main",
        definitions: []
      },
      browser: {
        base: "src/platform/browser",
          typescript: ["**/*.ts"],
          main: "main",
          definitions: []
      },
      electron: {
        base: "src/platform/electron",
        typescript: ["**/*.ts"],
        main: "main",
        definitions: []
      }
    }
  };
}

export class Locations {
  config: Config;

  constructor (config: any){
    this.config = _.merge({}, getDefaultConfig(), config);
  }

  getTypescriptSources(targetName: string, excludeSpec: boolean = false): string[] {
    let core = this.config.core;
    let target: TargetConfig = (<any> this.config.targets)[targetName];
    let sources: string[] = [].concat(
        core.definitions
          .map((definitionPath: string) => path.join(core.base, definitionPath)),
        target.definitions
          .map((sourcePath: string) => path.join(target.base, sourcePath)),
        core.typescript
          .map((definitionPath: string) => path.join(core.base, definitionPath)),
        target.typescript
          .map((sourcePath: string) => path.join(target.base, sourcePath))
      ).map(item => path.join(this.config.project.root, item));

    if (excludeSpec) {
      sources.push("!**/*.spec.ts");
    }

    return sources;
  }

  getSourceDirectory(targetName: string): string {
    switch (targetName) {
      case "browser":
        return path.join(this.config.project.root, this.config.targets.browser.base);
      case "electron":
        return path.join(this.config.project.root, this.config.targets.electron.base);
      case "node":
        return path.join(this.config.project.root, this.config.targets.node.base);
      default:
        throw new Error(`Unknown target ${targetName}`);
    }
  }

  getBuildDirectory(targetName: string): string {
    return path.join(this.config.project.root, this.config.project.build, targetName);
  }

  getDistDirectory(targetName: string): string {
    return path.join(this.config.project.root, this.config.project.dist, targetName);
  }

  getCoverageDirectory(targetName: string): string {
    return path.join(this.config.project.root, this.config.project.coverage, targetName);
  }
}

export default Locations;
