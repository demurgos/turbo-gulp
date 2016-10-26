import * as path from "path";
import {Gulp} from "gulp";

import {ProjectOptions, NodeTarget} from "../config/config";

import * as buildTypescript from "../task-generators/build-typescript";

export interface Options {
  project: ProjectOptions;
  target: NodeTarget;
  tsc: {typescript: any};
}

export function generateNodeTasks (gulp: Gulp, targetName: string, {project, target, tsc}: Options) {
  const buildDir: string = path.resolve(project.root, project.buildDir, targetName);
  const srcDir: string = path.resolve(project.root, project.srcDir, targetName);
  // const distDir: string = path.resolve(project.root, project.distDir);

  const baseDir: string = path.resolve(srcDir, target.baseDir);
  const sources: string[] = [...target.declarations, ...target.scripts];

  const buildTypescriptOptions: buildTypescript.BuildScriptsOptions = {
    tsOptions: tsc,
    baseDir: baseDir,
    sources: sources,
    buildDir: buildDir,
    srcDir: srcDir
  };

  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);
}
