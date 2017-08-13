import {FSWatcher} from "fs";
import {Gulp} from "gulp";
import {TaskFunc} from "orchestrator";
import {posix as path} from "path";
import {DEV_TSC_OPTIONS} from "../options/tsc";
import {mergeTypescriptOptions, TypescriptOptions} from "../options/typescript";
import {Project, ResolvedProject, resolveProject} from "../project";
import {NodeTarget} from "../targets";
import * as buildTypescript from "../task-generators/build-typescript";
import * as clean from "../task-generators/clean";
import {TaskFunction} from "../utils/gulp-task-function";
import {PackageJson, readJsonFile, writeJsonFile} from "../utils/project";
import {
  generateCopyTasks,
  generatePugTasks,
  generateSassTasks,
  generateTsconfigJsonTasks,
  ManyWatchFunction,
} from "./base";

export interface Locations {
  rootDir: string;
  srcDir: string;
  buildDir: string;
  distDir: string;
  packageJson: string;
}

/**
 * Resolve absolute POSIX paths (even on Windows) for the main locations
 *
 * @param project
 * @param target
 * @returns {Locations} The absolute locations
 */
export function resolveLocations(project: Project, target: NodeTarget): Locations {
  const targetDir: string = target.targetDir === undefined ? target.name : target.targetDir;
  const resolved: ResolvedProject = resolveProject(project);
  return {
    rootDir: resolved.absRoot,
    srcDir: path.join(resolved.absSrcDir, typeof target.srcDir === "string" ? target.srcDir : "."),
    buildDir: path.join(resolved.absBuildDir, targetDir),
    distDir: path.join(resolved.absDistDir, targetDir),
    packageJson: resolved.absPackageJson,
  };
}

export function generateTarget(gulp: Gulp, project: Project, target: NodeTarget) {
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
    distScripts: `${targetName}:dist:scripts`,
    distPackage: `${targetName}:dist:package`,
    tsconfigJson: `${targetName}:tsconfig.json`,
    watch: `${targetName}:watch`,
  };

  const buildTasks: string[] = [];
  const watchFunctions: ManyWatchFunction[] = [];

  // TODO: merge with project options
  const typescriptOptions: TypescriptOptions = mergeTypescriptOptions(DEV_TSC_OPTIONS, target.typescript);

  const buildTypescriptOptions: buildTypescript.Options = {
    compilerOptions: typescriptOptions.compilerOptions,
    strict: typescriptOptions.strict,
    typescript: typescriptOptions.typescript,
    typeRoots: target.typeRoots,
    scripts: target.scripts,
    buildDir: locations.buildDir,
    srcDir: locations.srcDir,
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
      locations.buildDir,
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
      locations.buildDir,
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
      locations.buildDir,
      target.copy,
    );
    mainTask.displayName = taskNames.buildCopy;
    gulp.task(mainTask.displayName, mainTask);
    buildTasks.push(mainTask.displayName);
    watchFunctions.push(mainWatch);
  }

  // target:build
  gulp.task(
    taskNames.build,
    <any> gulp.parallel(...buildTasks) as TaskFunc,
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
        path.relative(locations.rootDir, locations.distDir),
      ],
    };
  }
  const cleanTask: TaskFunction = clean.generateTask(gulp, cleanOptions);
  cleanTask.displayName = `${targetName}:clean`;
  gulp.task(cleanTask.displayName, cleanTask);

  // <targetName>:dist
  if (Boolean(target.distPackage)) {

    const buildTypescriptOptions: buildTypescript.Options = {
      compilerOptions: typescriptOptions.compilerOptions,
      strict: typescriptOptions.strict,
      typescript: typescriptOptions.typescript,
      typeRoots: target.typeRoots,
      scripts: target.scripts,
      buildDir: locations.distDir,
      srcDir: locations.distDir,
    };

    // <targetName>:dist:scripts
    const distScriptsTask: TaskFunction = buildTypescript.generateTask(gulp, buildTypescriptOptions);
    distScriptsTask.displayName = taskNames.distScripts;
    gulp.task(distScriptsTask.displayName, distScriptsTask);
    // buildTasks.push(distScriptsTask.displayName);
    // watchFunctions.push(() => [buildTypescript.watch(gulp, buildTypescriptOptions)]);

    gulp.task(
      taskNames.dist,
      <TaskFunc> gulp.series(
        cleanTask.displayName,
        function _srcToDist() {
          return gulp
            .src([path.join(locations.srcDir, "**/*.ts")], {base: locations.srcDir})
            .pipe(gulp.dest(locations.distDir));
        },
        distScriptsTask.displayName,
        async function _distPackage() {
          const pkg: PackageJson = await readJsonFile(path.join(locations.packageJson));
          if (typeof target.mainModule === "string") {
            pkg.main = `${target.mainModule}.js`;
            pkg.types = `${target.mainModule}.d.ts`;
          }
          return writeJsonFile(path.join(locations.distDir, "package.json"), pkg);
        },
      ),
    );
  } else {
    gulp.task(
      taskNames.dist,
      <TaskFunc> gulp.series(
        cleanTask.displayName,
        `${targetName}:build`,
        function _buildToDist() {
          return gulp
            .src([path.join(locations.buildDir, "**/*")], {base: locations.buildDir})
            .pipe(gulp.dest(locations.distDir));
        },
      ),
    );
  }

  // target:tsconfig.json
  if (target.typescript !== undefined && target.typescript.tsconfigJson !== undefined) {
    const tsconfigJsonTask: TaskFunction = generateTsconfigJsonTasks(
      gulp,
      locations.srcDir,
      buildTypescriptOptions,
      target.typescript.tsconfigJson,
    );
    tsconfigJsonTask.displayName = taskNames.tsconfigJson;
    gulp.task(tsconfigJsonTask.displayName, tsconfigJsonTask);
    buildTasks.push(tsconfigJsonTask.displayName);
  }
}
