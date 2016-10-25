import * as path from "path";
import del = require("del");

import {ProjectOptions, NodeTarget} from "../config/config";

import * as buildTypescript from "../task-generators/build-typescript";

export interface Options {
  project: ProjectOptions;
  target: NodeTarget;
  tsc: {typescript: any};
}

export function generateTarget (gulp: any, targetName: string, {project, target, tsc}: Options) {
  const buildDir: string = path.resolve(project.root, project.buildDir, targetName);
  const srcDir: string = path.resolve(project.root, project.srcDir);
  // const distDir: string = path.resolve(project.root, project.distDir, targetName);

  const baseDir: string = path.resolve(srcDir, target.baseDir);
  const sources: string[] = [...target.declarations, ...target.scripts];

  const buildTypescriptOptions: buildTypescript.BuildScriptsOptions = {
    tscOptions: tsc,
    baseDir: baseDir,
    sources: sources,
    buildDir: buildDir
  };

  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);

  gulp.task(`clean:${targetName}`, function() {
    return del(buildDir);
  });
}
