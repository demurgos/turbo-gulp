import Bluebird = require("bluebird");
import {Gulp, TaskFunction} from "gulp";
import {posix as path} from "path";
import {ProjectOptions, WebpackTarget} from "../config/config";
import * as buildTypescript from "../task-generators/build-typescript";
import * as buildWebpack from "../task-generators/build-webpack";
import * as copy from "../task-generators/copy";
import del = require("del");
import gulpSourceMaps = require("gulp-sourcemaps");
import {toUnix} from "../utils/locations";
import {generateCopyTasks, generatePugTasks, generateSassTasks} from "./base";

interface Locations {
  rootDir: string;
  buildDir: string;
  webpackDir: string;
  srcDir: string;
  distDir: string;
}

/**
 * Resolve absolute POSIX paths (even on Windows) for the main locations
 *
 * @param project
 * @param target
 * @returns {Locations} The absolute locations
 */
function resolveLocations(project: ProjectOptions, target: WebpackTarget): Locations {
  const targetDir: string = target.targetDir === undefined ? target.name : target.targetDir;

  const rootDir: string = toUnix(project.root);
  const srcDir: string = path.join(rootDir, toUnix(project.srcDir));
  const webpackDir: string = path.join(rootDir, toUnix(project.buildDir), target.webpackDir);
  const buildDir: string = path.join(rootDir, toUnix(project.buildDir), targetDir);
  const distDir: string = path.join(rootDir, toUnix(project.distDir), targetDir);

  return {rootDir, srcDir, webpackDir, buildDir, distDir};
}

export function generateTarget(gulp: Gulp, project: ProjectOptions, target: WebpackTarget) {
  const targetName: string = target.name;
  const locations: Locations = resolveLocations(project, target);

  // tslint:disable-next-line:typedef
  const taskNames = {
    buildScripts: `${targetName}:build:scripts`,
    buildPug: `${targetName}:build:pug`,
    buildSass: `${targetName}:build:sass`,
    buildCopy: `${targetName}:build:copy`,
    buildWebpack: `${targetName}:build:webpack`,
    build: `${targetName}:build`,
    clean: `${targetName}:clean`,
    dist: `${targetName}:dist`
  };

  const buildTasks: string[] = [];

  const buildTypescriptOptions: buildTypescript.Options = {
    compilerOptions: target.typescript !== undefined ? target.typescript.compilerOptions : undefined,
    typeRoots: target.typeRoots.map(toUnix),
    scripts: target.scripts,
    srcDir: locations.srcDir,
    buildDir: locations.webpackDir
  };

  // target:build:scripts
  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);
  buildTasks.push(taskNames.buildScripts);

  // target:build:pug
  if (target.pug !== undefined) {
    const mainPugTask: TaskFunction = generatePugTasks(
      gulp,
      locations.srcDir,
      locations.webpackDir,
      target.pug
    );
    mainPugTask.displayName = taskNames.buildPug;
    gulp.task(mainPugTask.displayName, mainPugTask);
    buildTasks.push(mainPugTask.displayName);
  }

  // target:build:sass
  if (target.sass !== undefined) {
    const mainSassTask: TaskFunction = generateSassTasks(
      gulp,
      locations.srcDir,
      locations.webpackDir,
      target.sass
    );
    mainSassTask.displayName = taskNames.buildSass;
    gulp.task(mainSassTask.displayName, mainSassTask);
    buildTasks.push(mainSassTask.displayName);
  }

  // target:build:copy
  if (target.copy !== undefined) {
    const mainCopyTask: TaskFunction = generateCopyTasks(
      gulp,
      locations.srcDir,
      locations.webpackDir,
      target.copy
    );
    mainCopyTask.displayName = taskNames.buildCopy;
    gulp.task(mainCopyTask.displayName, mainCopyTask);
    buildTasks.push(mainCopyTask.displayName);
  }

  // target:build:webpack
  const buildWebpackOptions: buildWebpack.Options = {
    projectRoot: locations.rootDir,
    srcDir: locations.webpackDir,
    buildDir: locations.buildDir,
    webpackOptions: target.webpackOptions,
    entry: target.mainModule
  };
  const webpackTask: TaskFunction = buildWebpack.generateTask(gulp, targetName, buildWebpackOptions);
  gulp.task(taskNames.buildWebpack, webpackTask);

  // target:build
  gulp.task(
    taskNames.build,
    gulp.series(gulp.parallel(...buildTasks), taskNames.buildWebpack)
  );

  // target:clean
  gulp.task(taskNames.clean, function () {
    return del([locations.buildDir, locations.webpackDir]);
  });

  // target:dist
  gulp.task(
    taskNames.dist,
    gulp.series(
      taskNames.clean,
      taskNames.build,
      async function _buildToDist() {
        await del([locations.distDir]);
        return gulp
          .src([path.join(locations.buildDir, "**/*")], {base: path.join(locations.buildDir)})
          .pipe(gulp.dest(locations.distDir));
      }
    )
  );
}
