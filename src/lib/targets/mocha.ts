import {Gulp, TaskFunction} from "gulp";
import * as gulpUtil from "gulp-util";
import {Readable as ReadableStream} from "stream";
import {Project, ResolvedProject, resolveProject} from "../project";
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
 * @param project Project to use.
 * @param target Non-resolved target.
 * @return Resolved target.
 */
function resolveMochaTarget(project: ResolvedProject, target: MochaTarget): ResolvedMochaTarget {
  return resolveTargetBase(project, target);
}

export interface MochaTasks extends BaseTasks {
  start: TaskFunction;
  run: TaskFunction;
}

/**
 * Generates and registers gulp tasks for the provided lib target.
 *
 * @param gulp Gulp instance where the tasks will be registered.
 * @param project Project configuration.
 * @param target Target configuration.
 */
export function registerMochaTargetTasks(gulp: Gulp, project: Project, target: MochaTarget): MochaTasks {
  const resolvedProject: ResolvedProject = resolveProject(project);
  const resolvedTarget: ResolvedMochaTarget = resolveMochaTarget(resolvedProject, target);
  const result: MochaTasks = <MochaTasks> registerBaseTasks(gulp, project, target);

  result.run = addTask(gulp, `${target.name}:run`, mocha.generateTask(gulp, {testDir: resolvedTarget.buildDir}));

  const startTasks: TaskFunction[] = [];
  if (result.clean !== undefined) {
    startTasks.push(result.clean);
  }
  startTasks.push(result.build);
  startTasks.push(result.run);

  result.start = addTask(gulp, target.name, gulp.series(startTasks));

  return result;
}
