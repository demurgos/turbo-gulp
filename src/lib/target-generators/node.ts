import {Gulp} from "gulp";
import {posix as path} from "path";
import {NodeTarget, ProjectOptions} from "../config/config";
import * as buildTypescript from "../task-generators/build-typescript";
import * as tsconfigJson from "../task-generators/tsconfig-json";
import {toUnix} from "../utils/locations";
import del = require("del");
import {TaskFunction} from "gulp";
import {generateCopyTasks, generatePugTasks, generateSassTasks} from "./base";

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
 * @param project
 * @param target
 * @returns {Locations} The absolute locations
 */
function resolveLocations(project: ProjectOptions, target: NodeTarget): Locations {
  const rootDir: string = toUnix(project.root);
  const buildDir: string = path.join(rootDir, toUnix(project.buildDir), target.name);
  const srcDir: string = path.join(rootDir, toUnix(project.srcDir));
  const distDir: string = path.join(rootDir, toUnix(project.distDir), target.name);

  const baseDir: string = path.join(srcDir, toUnix(target.baseDir));
  return {rootDir, buildDir, srcDir, distDir, baseDir};
}

export function generateTarget(gulp: Gulp, project: ProjectOptions, target: NodeTarget) {
  const targetName: string = target.name;
  const locations: Locations = resolveLocations(project, target);

  // tslint:disable-next-line:typedef
  const taskNames = {
    build: `${targetName}:build`,
    buildWebpackScripts: `${targetName}:build:scripts`,
    buildPug: `${targetName}:build:pug`,
    buildSass: `${targetName}:build:sass`,
    buildCopy: `${targetName}:build:copy`
  };

  const buildTasks: string[] = [];

  const buildTypescriptOptions: buildTypescript.Options = {
    tsOptions: target.typescriptOptions,
    typeRoots: target.typeRoots.map(toUnix),
    scripts: target.scripts,
    buildDir: locations.buildDir,
    srcDir: locations.srcDir
  };

  // target:build:scripts
  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);
  buildTasks.push(taskNames.buildWebpackScripts);

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
    gulp.parallel(...buildTasks)
  );

  // target:watch
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

  const generateTsconfigJsonOptions: tsconfigJson.Options = Object.assign({}, buildTypescriptOptions, {
    tsconfigPath: path.join(locations.baseDir, "tsconfig.json")
  });
  tsconfigJson.registerTask(gulp, targetName, generateTsconfigJsonOptions);
}
