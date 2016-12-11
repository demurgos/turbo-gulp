import Bluebird = require("bluebird");
import {Gulp, TaskFunction} from "gulp";
import {posix as path} from "path";
import {Configuration as WebpackConfiguration, Webpack} from "webpack";
import {AngularTarget, ProjectOptions} from "../config/config";
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
  const rootDir: string = toUnix(options.project.root);
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

  const webpackTask: TaskFunction = buildWebpack.generateTask(gulp, targetName, buildWebpackOptions);

  gulp.task(
    buildWebpack.getTaskName(targetName),
    gulp.series(
      gulp.parallel(
        `${targetName}:build:scripts`,
        `${targetName}:build:assets`
      ),
      webpackTask
    )
  );

  gulp.task(`${targetName}:build:pug`, function () {
    return gulp
      .src([path.join(assetsDir, "./**/*.pug")], {base: assetsDir})
      .pipe(gulpPug({locals: {}}))
      .pipe(gulp.dest(path.join(tmpDir, options.target.assetsDir)));
  });

  gulp.task(`${targetName}:build:sass`, function () {
    return gulp
      .src([path.join(assetsDir, "./**/*.scss")], {base: assetsDir})
      .pipe(gulpSourceMaps.init())
      .pipe(gulpSass().on("error", (gulpSass).logError))
      .pipe(gulpSourceMaps.write())
      .pipe(gulp.dest(path.join(tmpDir, options.target.assetsDir)));
  });

  gulp.task(
    `${targetName}:build:assets`,
    gulp.parallel(
      `${targetName}:build:pug`,
      `${targetName}:build:sass`
    )
  );

  generateCopyTasks(gulp, targetName, srcDir, buildDir, options.target);

  gulp.task(`${targetName}:build`, gulp.series(buildWebpack.getTaskName(targetName), `${targetName}:build:copy`));

  gulp.task(`${targetName}:clean`, function () {
    return del([buildDir, tmpDir]);
  });

  // dist = clean + build + copy
  gulp.task(
    `${targetName}:dist`,
    gulp.series(
      `${targetName}:clean`,
      `${targetName}:build`,
      function _buildToDist () {
        return del([distDir])
          .then((deleted: string[]) => {
            return gulp
              .src([path.join(buildDir, "**/*")], {base: path.join(buildDir)})
              .pipe(gulp.dest(distDir));
          });
      }
    )
  );
}
