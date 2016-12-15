import asyncDone = require("async-done");
import Bluebird = require("bluebird");
import {Gulp, TaskFunction} from "gulp";
import {posix as path} from "path";
import {ProjectOptions, PugOptions, Target, SassOptions} from "../config/config";
import * as copy from "../task-generators/copy";
import * as pug from "../task-generators/pug";
import * as sass from "../task-generators/sass";
import {streamToPromise} from "../utils/utils";

function asyncDoneAsync(fn: asyncDone.AsyncTask): Bluebird<any> {
  return Bluebird.fromCallback((cb) => {
    asyncDone(fn, cb);
  });
}

export interface Options {
  project: ProjectOptions;
  target: Target;
  tsOptions: {
    typescript: any
  };
  pug?: PugOptions[];
  sass?: any[];
}

/**
 * Groups the item according to the `name` property. Missing `name` is treated as `"default"`.
 *
 * @param items
 * @returns {{[p: string]: T[]}} A map of name to the list of its options
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

/**
 * Generate tasks such as:
 * `${targetName}:build:copy` and each `${targetName}:build:copy:${copyName}`
 */
export function generateCopyTasks(gulp: Gulp, targetName: string, srcDir: string,
                                  buildDir: string, targetOptions: Target): void {
  if (targetOptions.copy === undefined) {
    gulp.task(`${targetName}:build:copy`, function (done: () => void) {
      done();
    });
    return;
  }

  const namedCopies: string[] = [];
  const anonymousCopies: copy.Options[] = [];

  for (const copyConfig of targetOptions.copy) {
    const from: string = copyConfig.from === undefined ? srcDir : path.join(srcDir, copyConfig.from);
    const to: string = copyConfig.to === undefined ? buildDir : path.join(buildDir, copyConfig.to);
    const config: copy.Options = {
      from: from,
      files: copyConfig.files,
      to: to
    };

    if (copyConfig.name === undefined) {
      anonymousCopies.push(config);
    } else {
      const taskName: string = `${targetName}:build:copy:${copyConfig.name}`;
      gulp.task(taskName, copy.generateTask(gulp, targetName, config));
      namedCopies.push(taskName);
    }
  }

  gulp.task(`${targetName}:build:copy`, gulp.parallel(...namedCopies, function _copyDefault () {
    const promises: Promise<void>[] = anonymousCopies
      .map((copyOptions) => streamToPromise(copy.copy(gulp, copyOptions))); // TODO: use `async-done`

    return Bluebird.all(promises);
  }));
}

function mergePug(gulp: Gulp, srcDir: string, buildDir: string, pugOptions: PugOptions[]): TaskFunction {
  const tasks: TaskFunction[] = [];
  for (const options of pugOptions) {
    const from: string = options.from === undefined ? srcDir : path.join(srcDir, options.from);
    const files: string[] = options.files === undefined ? ["**/*.pug"] : options.files;
    const to: string = options.to === undefined ? buildDir : path.join(buildDir, options.to);

    const completeOptions: pug.Options = {from, files, to};
    if (options.options !== undefined) {
      completeOptions.pugOptions = options.options;
    }
    tasks.push(pug.generateTask(gulp, completeOptions));
  }
  return async function(): Promise<any> {
    await Promise.all(tasks.map(asyncDoneAsync));
    return;
  };
}

export function generatePugTasks(gulp: Gulp, srcDir: string, buildDir: string, pugOptions: PugOptions[]): TaskFunction {
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

function mergeSass(gulp: Gulp, srcDir: string, buildDir: string, sassOptions: SassOptions[]): TaskFunction {
  const tasks: TaskFunction[] = [];
  for (const options of sassOptions) {
    const from: string = options.from === undefined ? srcDir : path.join(srcDir, options.from);
    const files: string[] = options.files === undefined ? ["**/*.sass"] : options.files;
    const to: string = options.to === undefined ? buildDir : path.join(buildDir, options.to);

    const completeOptions: sass.Options = {from, files, to};
    if (options.options !== undefined) {
      completeOptions.sassOptions = options.options;
    }
    tasks.push(sass.generateTask(gulp, completeOptions));
  }
  return async function(): Promise<any> {
    await Promise.all(tasks.map(asyncDoneAsync));
    return;
  };
}

export function generateSassTasks(gulp: Gulp, srcDir: string, buildDir: string, sassOptions: SassOptions[]): TaskFunction {
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
