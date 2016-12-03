import Bluebird = require("bluebird");
import {posix as path} from "path";
import {Gulp} from "gulp";
import {Webpack, Configuration as WebpackConfiguration} from "webpack";
import {ProjectOptions, AngularTarget} from "../config/config";
import * as buildTypescript from "../task-generators/build-typescript";
import * as buildWebpack from "../task-generators/build-webpack";
import * as copy from "../task-generators/copy";
import del = require("del");
import typescript = require("typescript");
import gulpPug = require("gulp-pug");
import gulpSourceMaps = require("gulp-sourcemaps");
import gulpSass = require("gulp-sass");
import {generateCopyTasks} from "./base";

export interface Options {
  project: ProjectOptions;
  target: AngularTarget;
  tsOptions: {
    typescript: typeof typescript;
  };
  webpack: Webpack;
  webpackConfig: WebpackConfiguration;
}

function toUnix(p: string): string {
  return p.replace(/\\/g, "/");
}

export function generateTarget(gulp: Gulp, targetName: string, options: Options) {
  const rootDir = toUnix(options.project.root);
  const buildDir: string = path.join(rootDir, toUnix(options.project.buildDir), targetName);
  const tmpDir: string = path.join(rootDir, toUnix(options.project.buildDir), options.target.tmpDir);
  const srcDir: string = path.join(rootDir, toUnix(options.project.srcDir));
  const distDir: string = path.join(rootDir, toUnix(options.project.distDir), targetName);

  const baseDir: string = path.join(srcDir, toUnix(options.target.baseDir));
  const assetsDir: string = path.join(srcDir, toUnix(options.target.assetsDir));

  const buildTypescriptOptions: buildTypescript.Options = {
    tsOptions: options.tsOptions,
    typeRoots: options.target.typeRoots.map(toUnix),
    scripts: options.target.scripts,
    buildDir: tmpDir,
    srcDir: srcDir
  };

  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);

  const buildWebpackOptions: buildWebpack.Options = {
    projectRoot: rootDir,
    srcDir: tmpDir,
    buildDir: buildDir,
    webpack: options.webpack,
    webpackConfig: options.webpackConfig,
    entry: options.target.mainModule
  };

  const webpackTask = buildWebpack.generateTask(gulp, targetName, buildWebpackOptions);

  gulp.task(buildWebpack.getTaskName(targetName), [`${targetName}:build:scripts`], webpackTask);

  gulp.task(`${targetName}:build:assets:pug`, function () {
    return gulp
      .src([path.join(assetsDir, "./**/*.pug")], {base: assetsDir})
      .pipe(gulpPug({locals: {}}))
      .pipe(gulp.dest(buildDir));
  });

  gulp.task(`${targetName}:build:assets:sass`, function () {
    return gulp
      .src([path.join(assetsDir, "./**/*.scss")], {base: assetsDir})
      .pipe(gulpSourceMaps.init())
      .pipe(<NodeJS.ReadWriteStream> gulpSass().on("error", (<any> gulpSass).logError))
      .pipe(gulpSourceMaps.write())
      .pipe(gulp.dest(buildDir));
  });

  gulp.task(`${targetName}:build:assets:static`, copy.generateTask(gulp, targetName, {
    from: assetsDir,
    files: ["**/*", "!**/*.pug", "!**/*.scss"],
    to: buildDir
  }));

  gulp.task(`${targetName}:build:assets`, [
    `${targetName}:build:assets:pug`,
    `${targetName}:build:assets:sass`,
    `${targetName}:build:assets:static`
  ]);

  generateCopyTasks(gulp, targetName, srcDir, buildDir, options.target);

  gulp.task(`${targetName}:build`, [`${targetName}:build:webpack`, `${targetName}:build:assets`, `${targetName}:build:copy`]);

  gulp.task(`${targetName}:clean`, function () {
    return del([buildDir, tmpDir]);
  });

  gulp.task(`${targetName}:dist`, [`${targetName}:clean`, `${targetName}:build`], function () {
    return del([distDir])
      .then((deleted: string[]) => {
        return gulp
          .src([path.join(buildDir, "**/*")], {base: path.join(buildDir)})
          .pipe(gulp.dest(distDir));
      });
  });
}
