import Bluebird = require("bluebird");
import {Gulp, TaskFunction} from "gulp";
import {posix as path} from "path";
import {AngularTarget, ProjectOptions} from "../config/config";
import * as buildTypescript from "../task-generators/build-typescript";
import * as buildWebpack from "../task-generators/build-webpack";
import * as copy from "../task-generators/copy";
import del = require("del");
import gulpSourceMaps = require("gulp-sourcemaps");
import {generateCopyTasks, generatePugTasks, generateSassTasks} from "./base";
import {toUnix} from "../utils/locations";

interface Locations {
  rootDir: string;
  buildDir: string;
  webpackDir: string;
  srcDir: string;
  distDir: string;
  baseDir: string;
}

/**
 * Resolve absolute POSIX paths (even on Windows) for the main locations
 *
 * @param project
 * @param target
 * @returns {Locations} The absolute locations
 */
function resolveLocations(project: ProjectOptions, target: AngularTarget): Locations {
  const rootDir: string = toUnix(project.root);
  const buildDir: string = path.join(rootDir, toUnix(project.buildDir), target.name);
  const webpackDir: string = path.join(rootDir, toUnix(project.buildDir), target.webpackDir);
  const srcDir: string = path.join(rootDir, toUnix(project.srcDir));
  const distDir: string = path.join(rootDir, toUnix(project.distDir), target.name);

  const baseDir: string = path.join(srcDir, toUnix(target.baseDir));
  return {rootDir, buildDir, webpackDir, srcDir, distDir, baseDir};
}


export function generateTarget(gulp: Gulp, project: ProjectOptions, target: AngularTarget) {
  const targetName: string = target.name;
  const locations: Locations = resolveLocations(project, target);

  // tslint:disable-next-line:typedef
  const taskNames = {
    buildWebpackScripts: `${targetName}:build:scripts`,
    buildWebpackPug: `${targetName}:build:webpack:pug`,
    buildWebpackSass: `${targetName}:build:webpack:sass`,
    buildWebpackCopy: `${targetName}:build:webpack:copy`,
    buildWebpack: `${targetName}:build:webpack`,
    buildPug: `${targetName}:build:pug`,
    buildSass: `${targetName}:build:sass`,
    buildCopy: `${targetName}:build:copy`,
    build: `${targetName}:build`,
    clean: `${targetName}:clean`,
    dist: `${targetName}:dist`
  };

  const buildTasks: string[] = [];
  const buildWebpackTasks: string[] = [];

  const buildTypescriptOptions: buildTypescript.Options = {
    tsOptions: target.typescriptOptions,
    typeRoots: target.typeRoots.map(toUnix),
    scripts: target.scripts,
    srcDir: locations.srcDir,
    buildDir: locations.webpackDir
  };

  // target:build:webpack:scripts
  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);
  buildWebpackTasks.push(taskNames.buildWebpackScripts);

  // target:build:webpack:pug
  if (target.webpackPug !== undefined) {
    const mainPugTask: TaskFunction = generatePugTasks(gulp, locations.srcDir, locations.webpackDir, target.webpackPug);
    mainPugTask.displayName = taskNames.buildWebpackPug;
    gulp.task(mainPugTask.displayName, mainPugTask);
    buildWebpackTasks.push(mainPugTask.displayName);
  }

  // target:build:webpack:sass
  if (target.webpackSass !== undefined) {
    const mainSassTask: TaskFunction = generateSassTasks(gulp, locations.srcDir, locations.webpackDir, target.webpackSass);
    mainSassTask.displayName = taskNames.buildWebpackSass;
    gulp.task(mainSassTask.displayName, mainSassTask);
    buildWebpackTasks.push(mainSassTask.displayName);
  }

  // target:build:webpack:copy
  if (target.webpackCopy !== undefined) {
    const mainCopyTask: TaskFunction = generateCopyTasks(gulp, locations.srcDir, locations.webpackDir, target.webpackCopy);
    mainCopyTask.displayName = taskNames.buildWebpackCopy;
    gulp.task(mainCopyTask.displayName, mainCopyTask);
    buildWebpackTasks.push(mainCopyTask.displayName);
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

  // target:build:pug
  if (target.pug !== undefined) {
    const mainPugTask: TaskFunction = generatePugTasks(gulp, locations.srcDir, locations.buildDir, target.pug);
    mainPugTask.displayName = taskNames.buildPug;
    gulp.task(mainPugTask.displayName, mainPugTask);
    buildTasks.push(mainPugTask.displayName);
  }

  // target:build:sass
  if (target.sass !== undefined) {
    const mainSassTask: TaskFunction = generateSassTasks(gulp, locations.srcDir, locations.buildDir, target.sass);
    mainSassTask.displayName = taskNames.buildSass;
    gulp.task(mainSassTask.displayName, mainSassTask);
    buildTasks.push(mainSassTask.displayName);
  }

  // target:build:copy
  if (target.copy !== undefined) {
    const mainCopyTask: TaskFunction = generateCopyTasks(gulp, locations.srcDir, locations.buildDir, target.copy);
    mainCopyTask.displayName = taskNames.buildCopy;
    gulp.task(mainCopyTask.displayName, mainCopyTask);
    buildTasks.push(mainCopyTask.displayName);
  }

  // target:build
  gulp.task(
    taskNames.build,
    gulp.parallel(
      gulp.series(gulp.parallel(...buildWebpackTasks), taskNames.buildWebpack),
      ...buildTasks
    )
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
      async function _buildToDist () {
        await del([locations.distDir]);
        return gulp
          .src([path.join(locations.buildDir, "**/*")], {base: path.join(locations.buildDir)})
          .pipe(gulp.dest(locations.distDir));
      }
    )
  );
}
