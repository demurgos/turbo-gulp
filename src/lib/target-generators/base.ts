import asyncDone = require("async-done");
import Bluebird = require("bluebird");
import {Gulp, TaskFunction} from "gulp";
import {posix as path} from "path";
import {CopyOptions, PugOptions, SassOptions} from "../config/config";
import * as buildTypescript from "../task-generators/build-typescript";
import * as copy from "../task-generators/copy";
import * as pug from "../task-generators/pug";
import * as sass from "../task-generators/sass";
import * as tsconfigJson from "../task-generators/tsconfig-json";

function asyncDoneAsync(fn: asyncDone.AsyncTask): Bluebird<any> {
  return Bluebird.fromCallback((cb) => {
    asyncDone(fn, cb);
  });
}

/**
 * Groups the item according to the `name` property. Missing `name` is treated as `"default"`.
 *
 * @param items
 * @returns A map of name to the list of its options
 */
function groupByName<T extends {name?: string}>(items: T[]): {[name: string]: T[]} {
  const result: {[name: string]: T[]} = {};
  for (const item of items) {
    const name: string = item.name === undefined ? "default" : item.name;
    if (!(name in result)) {
      result[name] = [];
    }
    result[name].push(item);
  }
  return result;
}

function mergeCopy(gulp: Gulp, srcDir: string,
                   buildDir: string, copyOptions: CopyOptions[]): TaskFunction {
  const tasks: TaskFunction[] = [];
  for (const options of copyOptions) {
    const from: string = options.src === undefined ? srcDir : path.join(srcDir, options.src);
    const files: string[] = options.files === undefined ? ["**/*"] : options.files;
    const to: string = options.dest === undefined ? buildDir : path.join(buildDir, options.dest);

    const completeOptions: copy.Options = {from, files, to};
    tasks.push(copy.generateTask(gulp, completeOptions));
  }
  return async function (): Promise<void> {
    await Promise.all(tasks.map(asyncDoneAsync));
    return;
  };
}

export function generateCopyTasks(gulp: Gulp, srcDir: string,
                                  buildDir: string, copyOptions: CopyOptions[]): TaskFunction {
  const copyTasks: TaskFunction[] = [];
  const groups: {[name: string]: CopyOptions[]} = groupByName(copyOptions);

  for (const name in groups) {
    const subTask: TaskFunction = mergeCopy(gulp, srcDir, buildDir, groups[name]);
    subTask.displayName = `_copy:${name}`;
    copyTasks.push(subTask);
  }

  const mainTask: TaskFunction = gulp.parallel(...copyTasks);
  mainTask.displayName = `_copy`;

  return mainTask;
}

function mergePug(gulp: Gulp, srcDir: string,
                  buildDir: string, pugOptions: PugOptions[]): TaskFunction {
  const tasks: TaskFunction[] = [];
  for (const options of pugOptions) {
    const from: string = options.src === undefined ? srcDir : path.join(srcDir, options.src);
    const files: string[] = options.files === undefined ? ["**/*.pug"] : options.files;
    const to: string = options.dest === undefined ? buildDir : path.join(buildDir, options.dest);

    const completeOptions: pug.Options = {from, files, to};
    if (options.options !== undefined) {
      completeOptions.pugOptions = options.options;
    }
    tasks.push(pug.generateTask(gulp, completeOptions));
  }
  return async function (): Promise<any> {
    await Promise.all(tasks.map(asyncDoneAsync));
    return;
  };
}

export function generatePugTasks(gulp: Gulp, srcDir: string,
                                 buildDir: string, pugOptions: PugOptions[]): TaskFunction {
  const pugTasks: TaskFunction[] = [];
  const groups: {[name: string]: PugOptions[]} = groupByName(pugOptions);

  for (const name in groups) {
    const subTask: TaskFunction = mergePug(gulp, srcDir, buildDir, groups[name]);
    subTask.displayName = `_pug:${name}`;
    pugTasks.push(subTask);
  }

  const mainTask: TaskFunction = gulp.parallel(...pugTasks);
  mainTask.displayName = `_pug`;

  return mainTask;
}

function mergeSass(gulp: Gulp, srcDir: string,
                   buildDir: string, sassOptions: SassOptions[]): TaskFunction {
  const tasks: TaskFunction[] = [];
  for (const options of sassOptions) {
    const from: string = options.src === undefined ? srcDir : path.join(srcDir, options.src);
    const files: string[] = options.files === undefined ? ["**/*.scss"] : options.files;
    const to: string = options.dest === undefined ? buildDir : path.join(buildDir, options.dest);

    const completeOptions: sass.Options = {from, files, to};
    if (options.options !== undefined) {
      completeOptions.sassOptions = options.options;
    }
    tasks.push(sass.generateTask(gulp, completeOptions));
  }
  return async function (): Promise<any> {
    await Promise.all(tasks.map(asyncDoneAsync));
    return;
  };
}

export function generateSassTasks(gulp: Gulp, srcDir: string,
                                  buildDir: string, sassOptions: SassOptions[]): TaskFunction {
  const subTasks: TaskFunction[] = [];
  const groups: {[name: string]: SassOptions[]} = groupByName(sassOptions);

  for (const name in groups) {
    const subTask: TaskFunction = mergeSass(gulp, srcDir, buildDir, groups[name]);
    subTask.displayName = `_sass:${name}`;
    subTasks.push(subTask);
  }

  const mainTask: TaskFunction = gulp.parallel(...subTasks);
  mainTask.displayName = `_sass`;
  return mainTask;
}

export function generateTsconfigJsonTasks(gulp: Gulp, srcDir: string,
                                          tsOptions: buildTypescript.Options, tsconfigPaths: string[]): TaskFunction {
  const subTasks: TaskFunction[] = [];

  for (const tsconfigPath in tsconfigPaths) {
    const completeOptions: tsconfigJson.Options = Object.assign(
      {},
      tsOptions,
      {
        tsconfigPath: path.join(srcDir, tsconfigPath)
      }
    );
    const task: TaskFunction = tsconfigJson.generateTask(gulp, completeOptions);
    task.displayName = `_tsconfig.json:${tsconfigPath}`;
  }

  const mainTask: TaskFunction = gulp.parallel(...subTasks);
  mainTask.displayName = `_sass`;
  return mainTask;
}
