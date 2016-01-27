import * as path from 'path';
import * as _ from 'lodash';

export interface TargetConfig{
  base: string;
  typescript: string[];
  definitions: string[];
  main?: string;
}

export interface Config{
  project: {
    root: string;
    "package": string;
    build: string;
    dist: string;
    coverage: string;
  },
  core: TargetConfig,
  targets: {
    node?: TargetConfig;
    browser?: TargetConfig;
  }
}

export function getDefaultConfig():any{
  return {
    project: {
      root: process.cwd(),
      "package": 'package.json',
      build: 'build',
      dist: 'dist',
      coverage: 'coverage'
    },
    core: {
      base: 'src/core',
      typescript: ['**/*.ts'],
      definitions: []
    },
    targets: {
      node: {
        base: 'src/node',
        typescript: ['**/*.ts'],
        main: 'main',
        definitions: ['../../typings/main.d.ts', '../../typings/main/**/*.d.ts']
      },
    browser: {
      base: 'src/browser',
        typescript: ['**/*.ts'],
        main: 'main',
        definitions: ['../../typings/browser.d.ts', '../../typings/browser/**/*.d.ts']
    }
    }
  }
}

export default class Locations{
  config: Config;

  constructor (config: any){
    this.config = _.merge({}, getDefaultConfig(), config);
  }

  getTypescriptSources(targetName: string, excludeSpec: boolean = false):string[]{
    let core = this.config.core;
    let target = this.config.targets[targetName];
    console.log(this.config);
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

    if(excludeSpec){
      sources.push('!**/*.spec.ts');
    }

    return sources;
  }

  getBuildDirectory(targetName: string):string{
    return path.join(this.config.project.root, this.config.project.build, targetName);
  }

}
