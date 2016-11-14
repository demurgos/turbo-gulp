import Bluebird = require("bluebird");
import {join as joinPath} from "path";
import del = require("del");
import {Gulp} from "gulp";

import {ProjectOptions, NodeTarget} from "../config/config";

import * as buildTypescript from "../task-generators/build-typescript";
import * as generateTsconfig from "../task-generators/generate-tsconfig";

export interface Options {
  project: ProjectOptions;
  target: NodeTarget;
  tsOptions: {
    typescript: any
  };
}

export function generateTarget(gulp: Gulp, targetName: string, options: Options) {
  const buildDir: string = joinPath(options.project.root, options.project.buildDir, targetName);
  const srcDir: string = joinPath(options.project.root, options.project.srcDir);
  const distDir: string = joinPath(options.project.root, options.project.distDir, targetName);

  const baseDir: string = joinPath(srcDir, options.target.baseDir);

  const buildTypescriptOptions: buildTypescript.Options = {
    tsOptions: options.tsOptions,
    typeRoots: options.target.typeRoots,
    scripts: options.target.scripts,
    buildDir: buildDir,
    srcDir: srcDir
  };

  const generateTsconfigOptions: generateTsconfig.Options = Object.assign({}, buildTypescriptOptions, {
    tsconfigPath: joinPath(baseDir, "tsconfig.json")
  });

  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);
  generateTsconfig.registerTask(gulp, targetName, generateTsconfigOptions);

  gulp.task(`watch:${targetName}`, function () {
    const sources = buildTypescript.getSources(buildTypescriptOptions);
    gulp.watch(sources.scripts, {cwd: baseDir}, [`build:${targetName}`]);
  });

  gulp.task(`build:${targetName}`, [`build:${targetName}:scripts`]);

  gulp.task(`clean:${targetName}`, function () {
    return del(buildDir);
  });

  gulp.task(`dist:${targetName}`, [`clean:${targetName}`, `build:${targetName}`], function () {
    return del(distDir)
      .then((deleted: string[]) => {
        return gulp
          .src([joinPath(buildDir, "**/*")], {base: joinPath(buildDir)})
          .pipe(gulp.dest(distDir));
      });
  });
}
