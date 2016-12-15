import {Gulp} from "gulp";
import {posix as path} from "path";
import {NodeTarget, ProjectOptions} from "../config/config";
import * as buildTypescript from "../task-generators/build-typescript";
import * as tsconfigJson from "../task-generators/tsconfig-json";
import {toUnix} from "../utils/locations";
import del = require("del");
import {TaskFunction} from "gulp";
import {generateCopyTasks, generatePugTasks, Options as BaseOptions, generateSassTasks} from "./base";

export interface Options extends BaseOptions {
  target: NodeTarget;
}

interface Locations {
  rootDir: string;
  buildDir: string;
  srcDir: string;
  distDir: string;
  baseDir: string;
}

/**
 * Resolve absolute POSIX paths (even on Windows) for the main locations
 *
 * @param targetName
 * @param options
 * @returns {Locations} The absolute locations
 */
function resolveLocations(targetName: string, options: Options): Locations {
  const rootDir: string = toUnix(options.project.root);
  const buildDir: string = path.join(rootDir, toUnix(options.project.buildDir), targetName);
  const srcDir: string = path.join(rootDir, toUnix(options.project.srcDir));
  const distDir: string = path.join(rootDir, toUnix(options.project.distDir), targetName);

  const baseDir: string = path.join(srcDir, toUnix(options.target.baseDir));
  return {rootDir, buildDir, srcDir, distDir, baseDir};
}

export function generateTarget(gulp: Gulp, targetName: string, options: Options) {
  const locations: Locations = resolveLocations(targetName, options);
  // tslint:disable-next-line:typedef
  const taskNames = {
    build: `${targetName}:build`,
    buildScripts: `${targetName}:build:scripts`,
    buildPug: `${targetName}:build:pug`,
    buildSass: `${targetName}:build:sass`,
    buildCopy: `${targetName}:build:copy`
  };

  const buildTypescriptOptions: buildTypescript.Options = {
    tsOptions: options.tsOptions,
    typeRoots: options.target.typeRoots.map(toUnix),
    scripts: options.target.scripts,
    buildDir: locations.buildDir,
    srcDir: locations.srcDir
  };

  const generateTsconfigOptions: tsconfigJson.Options = Object.assign({}, buildTypescriptOptions, {
    tsconfigPath: path.join(locations.baseDir, "tsconfig.json")
  });

  const buildTasks: string[] = [];

  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);
  buildTasks.push(taskNames.buildScripts);
  tsconfigJson.registerTask(gulp, targetName, generateTsconfigOptions);

  generateCopyTasks(gulp, targetName, locations.srcDir, locations.buildDir, options.target);

  if (options.pug !== undefined) {
    const mainPugTask: TaskFunction = generatePugTasks(gulp, locations.srcDir, locations.buildDir, options.pug);
    mainPugTask.displayName = taskNames.buildPug;
    gulp.task(mainPugTask.displayName, mainPugTask);
    buildTasks.push(mainPugTask.displayName);
  }

  if (options.sass !== undefined) {
    const mainSassTask: TaskFunction = generateSassTasks(gulp, locations.srcDir, locations.buildDir, options.sass);
    mainSassTask.displayName = taskNames.buildSass;
    gulp.task(mainSassTask.displayName, mainSassTask);
    buildTasks.push(mainSassTask.displayName);
  }

  gulp.task(
    taskNames.build,
    gulp.series(
      gulp.parallel(...buildTasks),
      taskNames.buildCopy
    )
  );

  gulp.task(`${targetName}:watch`, function () {
    const sources: buildTypescript.Sources = buildTypescript.getSources(buildTypescriptOptions);
    gulp.watch(sources.scripts, {cwd: locations.baseDir}, gulp.parallel(`${targetName}:build`));
  });

  gulp.task(`${targetName}:clean`, function () {
    return del(locations.buildDir);
  });

  gulp.task(`${targetName}:dist`, gulp.series(`${targetName}:clean`, `${targetName}:build`, function _buildToDist () {
    return del(locations.distDir)
      .then((deleted: string[]) => {
        return gulp
          .src([path.join(locations.buildDir, "**/*")], {base: locations.buildDir})
          .pipe(gulp.dest(locations.distDir));
      });
  }));
}
