import {Gulp, TaskFunction} from "gulp";
import * as gulpUtil from "gulp-util";
import {Readable as ReadableStream} from "stream";
import * as mocha from "../task-generators/mocha";
import {addTask, BaseTasks, registerBaseTasks, ResolvedTargetBase, resolveTargetBase, TargetBase} from "./_base";

function gulpBufferSrc(filename: string, data: Buffer): NodeJS.ReadableStream {
  const src: ReadableStream = new ReadableStream({objectMode: true});
  src._read = function () {
    this.push(new gulpUtil.File({
      cwd: "",
      base: "",
      path: filename,
      contents: data,
    }));
    this.push(null);
  };
  return src;
}

/**
 * Represents a test build using Mocha, it runs with Node.
 */
export interface MochaTarget extends TargetBase {
}

/**
 * Mocha target with fully resolved paths and dependencies.
 */
interface ResolvedMochaTarget extends ResolvedTargetBase {
}

/**
 * Resolve absolute paths and dependencies for the provided target.
 *
 * @param target Non-resolved target.
 * @return Resolved target.
 */
function resolveMochaTarget(target: MochaTarget): ResolvedMochaTarget {
  return resolveTargetBase(target);
}

export interface MochaTasks extends BaseTasks {
  start: TaskFunction;
  run: TaskFunction;
}

/**
 * Generates and registers gulp tasks for the provided lib target.
 *
 * @param gulp Gulp instance where the tasks will be registered.
 * @param targetOptions Target configuration.
 */
export function registerMochaTargetTasks(gulp: Gulp, targetOptions: MochaTarget): MochaTasks {
  const target: ResolvedMochaTarget = resolveMochaTarget(targetOptions);
  const result: MochaTasks = <MochaTasks> registerBaseTasks(gulp, targetOptions);

  // run
  result.run = addTask(gulp, `${target.name}:run`, mocha.generateTask(gulp, {testDir: target.buildDir}));

  // start
  const startTasks: TaskFunction[] = [];
  if (result.clean !== undefined) {
    startTasks.push(result.clean);
  }
  startTasks.push(result.build);
  startTasks.push(result.run);
  result.start = addTask(gulp, target.name, gulp.series(startTasks));

  return result;
}
