import {Gulp, TaskFunction} from "gulp";
import {posix as path} from "path";
import {NodeTarget, ProjectOptions} from "../config/config";
import * as buildTypescript from "../task-generators/build-typescript";
import * as clean from "../task-generators/clean";
import {toUnix} from "../utils/locations";
import {generateCopyTasks, generatePugTasks, generateSassTasks, generateTsconfigJsonTasks} from "./base";

interface Locations {
  rootDir: string;
  srcDir: string;
  buildDir: string;
  distDir: string;
}

/**
 * Resolve absolute POSIX paths (even on Windows) for the main locations
 *
 * @param project
 * @param target
 * @returns {Locations} The absolute locations
 */
function resolveLocations(project: ProjectOptions, target: NodeTarget): Locations {
  const targetDir: string = target.targetDir === undefined ? target.name : target.targetDir;

  const rootDir: string = toUnix(project.root);
  const srcDir: string = path.join(rootDir, toUnix(project.srcDir));
  const buildDir: string = path.join(rootDir, toUnix(project.buildDir), targetDir);
  const distDir: string = path.join(rootDir, toUnix(project.distDir), targetDir);

  return {rootDir, srcDir, buildDir, distDir};
}

export function generateTarget(gulp: Gulp, project: ProjectOptions, target: NodeTarget) {
  const targetName: string = target.name;
  const locations: Locations = resolveLocations(project, target);

  // tslint:disable-next-line:typedef
  const taskNames = {
    build: `${targetName}:build`,
    buildScripts: `${targetName}:build:scripts`,
    buildPug: `${targetName}:build:pug`,
    buildSass: `${targetName}:build:sass`,
    buildCopy: `${targetName}:build:copy`,
    dist: `${targetName}:dist`,
    tsconfigJson: `${targetName}:tsconfig.json`
  };

  const buildTasks: string[] = [];

  const buildTypescriptOptions: buildTypescript.Options = {
    compilerOptions: target.typescript !== undefined ? target.typescript.compilerOptions : undefined,
    strict: target.typescript !== undefined ? target.typescript.strict : undefined,
    typescript: target.typescript !== undefined ? target.typescript.typescript : undefined,
    typeRoots: target.typeRoots,
    scripts: target.scripts,
    buildDir: locations.buildDir,
    srcDir: locations.srcDir
  };

  // target:build:scripts
  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);
  buildTasks.push(taskNames.buildScripts);

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

  // // target:watch
  // gulp.task(`${targetName}:watch`, function () {
  //   const sources: buildTypescript.Sources = buildTypescript.getSources(buildTypescriptOptions);
  //   gulp.watch(sources.scripts, {cwd: locations.baseDir}, gulp.parallel(`${targetName}:build`));
  // });

  // <targetName>:clean
  let cleanOptions: clean.Options;
  if (target.clean !== undefined) {
    cleanOptions =   {
      base: locations.rootDir,
      dirs: target.clean.dirs,
      files: target.clean.files
    };
  } else {
    cleanOptions =   {
      base: locations.rootDir,
      dirs: [
        path.relative(locations.rootDir, locations.buildDir),
        path.relative(locations.rootDir, locations.distDir)
      ]
    };
  }
  const cleanTask: TaskFunction = clean.generateTask(gulp, cleanOptions);
  cleanTask.displayName = `${targetName}:clean`;
  gulp.task(cleanTask.displayName, cleanTask);

  gulp.task(taskNames.dist, gulp.series(cleanTask.displayName, `${targetName}:build`, function _buildToDist () {
    return gulp
      .src([path.join(locations.buildDir, "**/*")], {base: locations.buildDir})
      .pipe(gulp.dest(locations.distDir));
  }));

  // target:tsconfig.json
  if (target.typescript !== undefined && target.typescript.tsconfigJson !== undefined) {
    const mainCopyTask: TaskFunction = generateTsconfigJsonTasks(
      gulp,
      locations.srcDir,
      buildTypescriptOptions,
      target.typescript.tsconfigJson
    );
    mainCopyTask.displayName = taskNames.tsconfigJson;
    gulp.task(mainCopyTask.displayName, mainCopyTask);
    buildTasks.push(mainCopyTask.displayName);
  }
}
