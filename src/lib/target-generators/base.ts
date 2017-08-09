import asyncDone = require("async-done");
import {FSWatcher} from "fs";
import {Gulp} from "gulp";
import {posix as path} from "path";
import {CopyOptions} from "../options/copy";
import {PugOptions} from "../options/pug";
import {SassOptions} from "../options/sass";
import * as buildTypescript from "../task-generators/build-typescript";
import * as copy from "../task-generators/copy";
import * as pug from "../task-generators/pug";
import * as sass from "../task-generators/sass";
import * as tsconfigJson from "../task-generators/tsconfig-json";
import {TaskFunction} from "../utils/gulp-task-function";

function asyncDoneAsync(fn: asyncDone.AsyncTask): Promise<any> {
  return new Promise((resolve, reject) => {
    asyncDone(fn, (err: Error | null | undefined, result: any) => {
      if (err === undefined || err === null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
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

export type WatchFunction = () => FSWatcher;
export type ManyWatchFunction = () => FSWatcher[];

function mergeCopy(
  gulp: Gulp,
  srcDir: string,
  buildDir: string,
  copyOptions: CopyOptions[],
): [TaskFunction, ManyWatchFunction] {
  const tasks: TaskFunction[] = [];
  const watchFunctions: WatchFunction[] = [];
  for (const options of copyOptions) {
    const from: string = options.src === undefined ? srcDir : path.join(srcDir, options.src);
    const files: string[] = options.files === undefined ? ["**/*"] : options.files;
    const to: string = options.dest === undefined ? buildDir : path.join(buildDir, options.dest);

    const completeOptions: copy.Options = {from, files, to};
    tasks.push(copy.generateTask(gulp, completeOptions));
    watchFunctions.push(() => copy.watch(gulp, completeOptions));
  }

  const task: TaskFunction = async function (): Promise<void> {
    await Promise.all(tasks.map(asyncDoneAsync));
    return;
  };
  const watch: ManyWatchFunction = function (): FSWatcher[] {
    return watchFunctions.map((fn) => fn());
  };
  return [task, watch];
}

export function generateCopyTasks(
  gulp: Gulp,
  srcDir: string,
  buildDir: string,
  copyOptions: CopyOptions[],
): [TaskFunction, ManyWatchFunction] {
  const subTasks: TaskFunction[] = [];
  const subWatchs: ManyWatchFunction[] = [];
  const groups: {[name: string]: CopyOptions[]} = groupByName(copyOptions);

  for (const name in groups) {
    const [subTask, subWatch]: [TaskFunction, ManyWatchFunction] = mergeCopy(gulp, srcDir, buildDir, groups[name]);
    subTask.displayName = `_copy:${name}`;
    subTasks.push(subTask);
    subWatchs.push(subWatch);
  }

  const mainTask: TaskFunction = gulp.parallel(...subTasks);
  mainTask.displayName = `_copy`;
  const mainWatch: ManyWatchFunction = function (): FSWatcher[] {
    const watchers: FSWatcher[] = [];
    for (const fn of subWatchs) {
      const subWatchers: FSWatcher[] = fn();
      for (const watcher of subWatchers) {
        watchers.push(watcher);
      }
    }
    return watchers;
  };
  return [mainTask, mainWatch];
}

function mergePug(
  gulp: Gulp,
  srcDir: string,
  buildDir: string,
  pugOptions: PugOptions[],
): [TaskFunction, ManyWatchFunction] {
  const tasks: TaskFunction[] = [];
  const watchFunctions: WatchFunction[] = [];
  for (const options of pugOptions) {
    const from: string = options.src === undefined ? srcDir : path.join(srcDir, options.src);
    const files: string[] = options.files === undefined ? ["**/*.pug"] : options.files;
    const to: string = options.dest === undefined ? buildDir : path.join(buildDir, options.dest);

    const completeOptions: pug.Options = {from, files, to};
    if (options.options !== undefined) {
      completeOptions.pugOptions = options.options;
    }
    tasks.push(pug.generateTask(gulp, completeOptions));
    watchFunctions.push(() => pug.watch(gulp, completeOptions));
  }

  const task: TaskFunction = async function (): Promise<void> {
    await Promise.all(tasks.map(asyncDoneAsync));
    return;
  };
  const watch: ManyWatchFunction = function (): FSWatcher[] {
    return watchFunctions.map((fn) => fn());
  };
  return [task, watch];
}

export function generatePugTasks(
  gulp: Gulp,
  srcDir: string,
  buildDir: string,
  pugOptions: PugOptions[],
): [TaskFunction, ManyWatchFunction] {
  const subTasks: TaskFunction[] = [];
  const subWatchs: ManyWatchFunction[] = [];
  const groups: {[name: string]: PugOptions[]} = groupByName(pugOptions);

  for (const name in groups) {
    const [subTask, subWatch]: [TaskFunction, ManyWatchFunction] = mergePug(gulp, srcDir, buildDir, groups[name]);
    subTask.displayName = `_pug:${name}`;
    subTasks.push(subTask);
    subWatchs.push(subWatch);
  }

  const mainTask: TaskFunction = gulp.parallel(...subTasks);
  mainTask.displayName = `_pug`;
  const mainWatch: ManyWatchFunction = function (): FSWatcher[] {
    const watchers: FSWatcher[] = [];
    for (const fn of subWatchs) {
      const subWatchers: FSWatcher[] = fn();
      for (const watcher of subWatchers) {
        watchers.push(watcher);
      }
    }
    return watchers;
  };
  return [mainTask, mainWatch];
}

function mergeSass(
  gulp: Gulp,
  srcDir: string,
  buildDir: string,
  sassOptions: SassOptions[],
): [TaskFunction, ManyWatchFunction] {
  const tasks: TaskFunction[] = [];
  const watchFunctions: WatchFunction[] = [];
  for (const options of sassOptions) {
    const from: string = options.src === undefined ? srcDir : path.join(srcDir, options.src);
    const files: string[] = options.files === undefined ? ["**/*.scss"] : options.files;
    const to: string = options.dest === undefined ? buildDir : path.join(buildDir, options.dest);

    const completeOptions: sass.Options = {from, files, to};
    if (options.options !== undefined) {
      completeOptions.sassOptions = options.options;
    }
    tasks.push(sass.generateTask(gulp, completeOptions));
    watchFunctions.push(() => sass.watch(gulp, completeOptions));
  }

  const task: TaskFunction = async function (): Promise<void> {
    await Promise.all(tasks.map(asyncDoneAsync));
    return;
  };
  const watch: ManyWatchFunction = function (): FSWatcher[] {
    return watchFunctions.map((fn) => fn());
  };
  return [task, watch];
}

export function generateSassTasks(
  gulp: Gulp,
  srcDir: string,
  buildDir: string,
  sassOptions: SassOptions[],
): [TaskFunction, ManyWatchFunction] {
  const subTasks: TaskFunction[] = [];
  const subWatchs: ManyWatchFunction[] = [];
  const groups: {[name: string]: SassOptions[]} = groupByName(sassOptions);

  for (const name in groups) {
    const [subTask, subWatch]: [TaskFunction, ManyWatchFunction] = mergeSass(gulp, srcDir, buildDir, groups[name]);
    subTask.displayName = `_sass:${name}`;
    subTasks.push(subTask);
    subWatchs.push(subWatch);
  }

  const mainTask: TaskFunction = gulp.parallel(...subTasks);
  mainTask.displayName = `_sass`;
  const mainWatch: ManyWatchFunction = function (): FSWatcher[] {
    const watchers: FSWatcher[] = [];
    for (const fn of subWatchs) {
      const subWatchers: FSWatcher[] = fn();
      for (const watcher of subWatchers) {
        watchers.push(watcher);
      }
    }
    return watchers;
  };
  return [mainTask, mainWatch];
}

export function generateTsconfigJsonTasks(
  gulp: Gulp,
  srcDir: string,
  tsOptions: buildTypescript.Options,
  tsconfigPaths: string[],
): TaskFunction {
  const subTasks: TaskFunction[] = [];

  for (const tsconfigPath of tsconfigPaths) {
    const completeOptions: tsconfigJson.Options = {
      ...tsOptions,
      tsconfigPath: path.join(srcDir, tsconfigPath),
    };
    const task: TaskFunction = tsconfigJson.generateTask(gulp, completeOptions);
    task.displayName = `_tsconfig.json:${tsconfigPath}`;
    subTasks.push(task);
  }

  const mainTask: TaskFunction = gulp.parallel(...subTasks);
  mainTask.displayName = `_tsconfig`;
  return mainTask;
}
