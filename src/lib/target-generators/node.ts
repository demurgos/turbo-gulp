import Bluebird = require("bluebird");
import {resolve as resolvePath} from "path";
import del = require("del");
import {Gulp} from "gulp";

import {ProjectOptions, NodeTarget} from "../config/config";

import * as buildTypescript from "../task-generators/build-typescript";

export interface Options {
  project: ProjectOptions;
  target: NodeTarget;
  tsOptions: {
    typescript: any
  };
}

export function generateTarget (gulp: Gulp, targetName: string, {project, target, tsOptions}: Options) {
  const buildDir: string = resolvePath(project.root, project.buildDir, targetName);
  const srcDir: string = resolvePath(project.root, project.srcDir);
  const distDir: string = resolvePath(project.root, project.distDir, targetName);

  const baseDir: string = resolvePath(srcDir, target.baseDir);
  const sources: string[] = [...target.declarations, ...target.scripts];

  const buildTypescriptOptions: buildTypescript.BuildScriptsOptions = {
    tsOptions: tsOptions,
    baseDir: baseDir,
    sources: sources,
    buildDir: buildDir
  };

  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);

  gulp.task(`build:${targetName}`, [`build:${targetName}:scripts`]);

  gulp.task(`clean:${targetName}`, function() {
    return del(buildDir);
  });

  gulp.task(`dist:${targetName}`, [`clean:${targetName}`, `build:${targetName}`], function () {
    return del(distDir)
      .then((deleted: string[]) => {
        return gulp
          .src([resolvePath(buildDir, "**/*")], {base: resolvePath(buildDir)})
          .pipe(gulp.dest(distDir));
      });
  });
}
