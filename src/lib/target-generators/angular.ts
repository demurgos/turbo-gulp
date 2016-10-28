import Bluebird = require("bluebird");
import {resolve as resolvePath} from "path";
import del = require("del");
import {Gulp} from "gulp";
import {Webpack, Configuration as WebpackConfiguration} from "webpack";
import typescript = require("typescript");
import gulpPug = require("gulp-pug");

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
  const srcDir: string = resolvePath(root, options.project.srcDir);
  const distDir: string = resolvePath(root, options.project.distDir, targetName);

  const baseDir: string = resolvePath(srcDir, options.target.baseDir);
  const assetsDir: string = resolvePath(srcDir, options.target.assetsDir);
  const sources: string[] = [...options.target.declarations, ...options.target.scripts];

  const buildTypescriptOptions: buildTypescript.Options = {
    tsOptions: options.tsOptions,
    sources: sources,
    buildDir: tmpDir,
    srcDir: srcDir
  };

  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);

  const buildWebpackOptions: buildWebpack.Options = {
    projectRoot: root,
    srcDir: tmpDir,
    buildDir: buildDir,
    webpack: options.webpack,
    webpackConfig: options.webpackConfig,
    entry: options.target.mainModule
  };

  const webpackTask = buildWebpack.generateTask(gulp, targetName, buildWebpackOptions);

  gulp.task(buildWebpack.getTaskName(targetName), [`build:${targetName}:scripts`], webpackTask);

  gulp.task(`build:${targetName}:assets:pug`, function () {
    return gulp
      .src([resolvePath(assetsDir, "./**/*.pug")], {base: assetsDir})
      .pipe(gulpPug({locals: {}}))
      .pipe(gulp.dest(buildDir));
  });

  gulp.task(`build:${targetName}:assets:static`, function () {
    return gulp
      .src(
        [
          resolvePath(assetsDir, "./**/*"),
          "!" + resolvePath(assetsDir, "./**/*.pug")
        ],
        {
          base: assetsDir
        }
      )
      .pipe(gulp.dest(buildDir));
  });

  gulp.task(`build:${targetName}:assets`, [`build:${targetName}:assets:pug`, `build:${targetName}:assets:static`]);

  gulp.task(`build:${targetName}`, [`build:${targetName}:webpack`, `build:${targetName}:assets`]);

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
