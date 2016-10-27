import Bluebird = require("bluebird");
import {resolve as resolvePath} from "path";
import del = require("del");
import {Gulp} from "gulp";
import {Webpack, Configuration as WebpackConfiguration} from "webpack";
import typescript = require("typescript");

import {ProjectOptions, AngularTarget} from "../config/config";

import * as buildTypescript from "../task-generators/build-typescript";
import * as buildWebpack from "../task-generators/build-webpack";

export interface Options {
  project: ProjectOptions;
  target: AngularTarget;
  tsOptions: {
    typescript: typeof typescript;
  };
  webpack: Webpack;
  webpackConfig: WebpackConfiguration;
}

export function generateTarget (gulp: Gulp, targetName: string, options: Options) {
  const root: string = resolvePath(options.project.root);
  const buildDir: string = resolvePath(root, options.project.buildDir, targetName);
  const tmpDir: string = resolvePath(root, options.project.buildDir, options.target.tmpDir);
  const typescriptOutputDir: string = resolvePath(tmpDir, "typescript-output");
  const srcDir: string = resolvePath(root, options.project.srcDir);
  const distDir: string = resolvePath(root, options.project.distDir, targetName);

  const baseDir: string = resolvePath(srcDir, options.target.baseDir);
  const sources: string[] = [...options.target.declarations, ...options.target.scripts];

  const buildTypescriptOptions: buildTypescript.Options = {
    tsOptions: options.tsOptions,
    sources: sources,
    buildDir: typescriptOutputDir,
    srcDir: srcDir
  };

  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);

  const buildWebpackOptions: buildWebpack.Options = {
    projectRoot: root,
    srcDir: typescriptOutputDir,
    buildDir: buildDir,
    webpack: options.webpack,
    webpackConfig: options.webpackConfig,
    entry: options.target.mainModule
  };

  const webpackTask = buildWebpack.generateTask(gulp, targetName, buildWebpackOptions);

  gulp.task(buildWebpack.getTaskName(targetName), [`build:${targetName}:scripts`], webpackTask);

  gulp.task(`build:${targetName}`, [`build:${targetName}:webpack`]);

  gulp.task(`clean:${targetName}`, function() {
    return del([buildDir, tmpDir]);
  });

  gulp.task(`dist:${targetName}`, [`clean:${targetName}`, `build:${targetName}`], function () {
    return del([distDir])
      .then((deleted: string[]) => {
        return gulp
          .src([resolvePath(buildDir, "**/*")], {base: resolvePath(buildDir)})
          .pipe(gulp.dest(distDir));
      });
  });
}
