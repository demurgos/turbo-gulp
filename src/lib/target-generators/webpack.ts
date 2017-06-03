import Bluebird = require("bluebird");
import {Gulp} from "gulp";
import {posix as path} from "path";
import {ProjectOptions, WebpackTarget} from "../config/config";
import * as buildTypescript from "../task-generators/build-typescript";
import * as buildWebpack from "../task-generators/build-webpack";
import * as clean from "../task-generators/clean";
import del = require("del");
import {FSWatcher} from "fs";
import gulpSourceMaps = require("gulp-sourcemaps");
import {TaskFunc} from "orchestrator";
import {TaskFunction} from "../utils/gulp-task-function";
import {toUnix} from "../utils/locations";
import {
  generateCopyTasks, generatePugTasks, generateSassTasks, generateTsconfigJsonTasks,
  ManyWatchFunction,
} from "./base";

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
    dist: `${targetName}:dist`,
    tsconfigJson: `${targetName}:tsconfig.json`,
    watch: `${targetName}:watch`,
  };

  const buildTasks: string[] = [];
  const watchFunctions: ManyWatchFunction[] = [];

  const buildTypescriptOptions: buildTypescript.Options = {
    compilerOptions: target.typescript !== undefined ? target.typescript.compilerOptions : undefined,
    typeRoots: target.typeRoots.map(toUnix),
    scripts: target.scripts,
    srcDir: locations.srcDir,
    buildDir: locations.webpackDir,
  };

  // target:build:scripts
  const buildScriptsTask: TaskFunction = buildTypescript.generateTask(gulp, buildTypescriptOptions);
  buildScriptsTask.displayName = taskNames.buildScripts;
  gulp.task(buildScriptsTask.displayName, buildScriptsTask);
  buildTasks.push(buildScriptsTask.displayName);
  watchFunctions.push(() => [buildTypescript.watch(gulp, buildTypescriptOptions)]);

  // target:build:pug
  if (target.pug !== undefined) {
    const [mainTask, mainWatch]: [TaskFunction, ManyWatchFunction] = generatePugTasks(
      gulp,
      locations.srcDir,
      locations.webpackDir,
      target.pug,
    );
    mainTask.displayName = taskNames.buildPug;
    gulp.task(mainTask.displayName, mainTask);
    buildTasks.push(mainTask.displayName);
    watchFunctions.push(mainWatch);
  }

  // target:build:sass
  if (target.sass !== undefined) {
    const [mainTask, mainWatch]: [TaskFunction, ManyWatchFunction] = generateSassTasks(
      gulp,
      locations.srcDir,
      locations.webpackDir,
      target.sass,
    );
    mainTask.displayName = taskNames.buildSass;
    gulp.task(mainTask.displayName, mainTask);
    buildTasks.push(mainTask.displayName);
    watchFunctions.push(mainWatch);
  }

  // target:build:copy
  if (target.copy !== undefined) {
    const [mainTask, mainWatch]: [TaskFunction, ManyWatchFunction] = generateCopyTasks(
      gulp,
      locations.srcDir,
      locations.webpackDir,
      target.copy,
    );
    mainTask.displayName = taskNames.buildCopy;
    gulp.task(mainTask.displayName, mainTask);
    buildTasks.push(mainTask.displayName);
    watchFunctions.push(mainWatch);
  }

  // target:build:webpack
  const buildWebpackOptions: buildWebpack.Options = {
    projectRoot: locations.rootDir,
    srcDir: locations.webpackDir,
    buildDir: locations.buildDir,
    webpackOptions: target.webpackOptions,
    entry: target.mainModule,
  };
  const webpackTask: TaskFunction = buildWebpack.generateTask(gulp, buildWebpackOptions);
  webpackTask.displayName = taskNames.buildWebpack;
  gulp.task(webpackTask.displayName, webpackTask);
  watchFunctions.push(() => [buildWebpack.watch(gulp, buildWebpackOptions)]);

  // target:build
  gulp.task(
    taskNames.build,
    <any> gulp.series(<any> gulp.parallel(...buildTasks), taskNames.buildWebpack) as TaskFunc,
  );

  // target:watch
  gulp.task(taskNames.watch, async function (): Promise<FSWatcher[]> {
    const watchers: FSWatcher[] = [];
    for (const fn of watchFunctions) {
      const subWatchers: FSWatcher[] = fn();
      for (const sub of subWatchers) {
        watchers.push(sub);
      }
    }
    return Promise.all(watchers);
  });

  // <targetName>:clean
  let cleanOptions: clean.Options;
  if (target.clean !== undefined) {
    cleanOptions = {
      base: locations.rootDir,
      dirs: target.clean.dirs,
      files: target.clean.files,
    };
  } else {
    cleanOptions = {
      base: locations.rootDir,
      dirs: [
        path.relative(locations.rootDir, locations.buildDir),
        path.relative(locations.rootDir, locations.webpackDir),
        path.relative(locations.rootDir, locations.distDir),
      ],
    };
  }
  const cleanTask: TaskFunction = clean.generateTask(gulp, cleanOptions);
  cleanTask.displayName = taskNames.clean;
  gulp.task(cleanTask.displayName, cleanTask);

  // target:dist
  gulp.task(
    taskNames.dist,
    <TaskFunc> gulp.series(
      cleanTask.displayName,
      taskNames.build,
      async function _buildToDist() {
        await del([locations.distDir]);
        return gulp
          .src([path.join(locations.buildDir, "**/*")], {base: path.join(locations.buildDir)})
          .pipe(gulp.dest(locations.distDir));
      },
    ),
  );

  // target:tsconfig.json
  if (target.typescript !== undefined && target.typescript.tsconfigJson !== undefined) {
    const mainCopyTask: TaskFunction = generateTsconfigJsonTasks(
      gulp,
      locations.srcDir,
      buildTypescriptOptions,
      target.typescript.tsconfigJson,
    );
    mainCopyTask.displayName = taskNames.tsconfigJson;
    gulp.task(mainCopyTask.displayName, mainCopyTask);
    buildTasks.push(mainCopyTask.displayName);
  }
}
