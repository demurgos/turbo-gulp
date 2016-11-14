import Bluebird = require("bluebird");
import {join as joinPath} from "path";
import del = require("del");
import {Gulp} from "gulp";
import {Webpack, Configuration as WebpackConfiguration} from "webpack";
import typescript = require("typescript");
import gulpPug = require("gulp-pug");
import gulpSourceMaps = require("gulp-sourcemaps");
import gulpSass = require("gulp-sass");

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
  const root: string = joinPath(options.project.root);
  const buildDir: string = joinPath(root, options.project.buildDir, targetName);
  const tmpDir: string = joinPath(root, options.project.buildDir, options.target.tmpDir);
  const srcDir: string = joinPath(root, options.project.srcDir);
  const distDir: string = joinPath(root, options.project.distDir, targetName);

  const baseDir: string = joinPath(srcDir, options.target.baseDir);
  const assetsDir: string = joinPath(srcDir, options.target.assetsDir);

  const buildTypescriptOptions: buildTypescript.Options = {
    tsOptions: options.tsOptions,
    typeRoots: options.target.typeRoots,
    scripts: options.target.scripts,
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
      .src([joinPath(assetsDir, "./**/*.pug")], {base: assetsDir})
      .pipe(gulpPug({locals: {}}))
      .pipe(gulp.dest(buildDir));
  });

  gulp.task(`build:${targetName}:assets:sass`, function () {
    return gulp
      .src([joinPath(assetsDir, "./**/*.scss")], {base: assetsDir})
      .pipe(gulpSourceMaps.init())
      .pipe(<NodeJS.ReadWriteStream> gulpSass().on("error", (<any> gulpSass).logError))
      .pipe(gulpSourceMaps.write())
      .pipe(gulp.dest(buildDir));
  });

  gulp.task(`build:${targetName}:assets:static`, function () {
    return gulp
      .src(
        [
          joinPath(assetsDir, "./**/*"),
          "!" + joinPath(assetsDir, "./**/*.pug"),
          "!" + joinPath(assetsDir, "./**/*.scss"),
        ],
        {
          base: assetsDir
        }
      )
      .pipe(gulp.dest(buildDir));
  });

  gulp.task(`build:${targetName}:assets`, [
    `build:${targetName}:assets:pug`,
    `build:${targetName}:assets:sass`,
    `build:${targetName}:assets:static`
  ]);

  gulp.task(`build:${targetName}`, [`build:${targetName}:webpack`, `build:${targetName}:assets`]);

  gulp.task(`clean:${targetName}`, function() {
    return del([buildDir, tmpDir]);
  });

  gulp.task(`dist:${targetName}`, [`clean:${targetName}`, `build:${targetName}`], function () {
    return del([distDir])
      .then((deleted: string[]) => {
        return gulp
          .src([joinPath(buildDir, "**/*")], {base: joinPath(buildDir)})
          .pipe(gulp.dest(distDir));
      });
  });
}
