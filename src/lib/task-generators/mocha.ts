import { Gulp } from "gulp";
import * as gulpMocha from "gulp-mocha";
import { Minimatch } from "minimatch";
import { toPosix } from "../project";
import { AbsPosixPath } from "../types";
import { TaskFunction } from "../utils/gulp-task-function";
import * as matcher from "../utils/matcher";

const mochaBin: AbsPosixPath = toPosix(require.resolve("mocha/bin/mocha"));

export type MochaReporter = "spec";

export interface MochaOptions {
  testDir: AbsPosixPath;
  reporter?: MochaReporter;
}

interface ResolvedMochaOptions {
  testDir: AbsPosixPath;
  reporter: MochaReporter;
}

function resolveOptions(options: MochaOptions): ResolvedMochaOptions {
  return {reporter: "spec", ...options};
}

export interface Sources {
  baseDir: string;
  specs: string[];
}

export function getSources(options: MochaOptions): Sources {
  const baseDir: string = options.testDir;
  const specs: string = matcher.asString(matcher.join(baseDir, new Minimatch("**/*.spec.js")));

  return {
    baseDir,
    specs: [specs],
  };
}

/**
 * Return the command line arguments equivalent to this task
 *
 * @param options Mocha options
 * @param colors Force colors
 * @return Command line arguments
 */
export function getCommand(options: MochaOptions, colors: boolean): string[] {
  const resolved: ResolvedMochaOptions = resolveOptions(options);
  const sources: Sources = getSources(options);
  const result: string[] = [mochaBin];
  result.push("--ui", "bdd");
  result.push("--reporter", resolved.reporter);
  if (colors) {
    result.push("--colors");
  }
  result.push("--", ...sources.specs);
  return result;
}

export function generateTask(gulp: Gulp, options: MochaOptions): TaskFunction {
  const resolved: ResolvedMochaOptions = resolveOptions(options);
  const sources: Sources = getSources(options);

  const task: TaskFunction = function () {
    return gulp
      .src(sources.specs, {base: sources.baseDir})
      .pipe(gulpMocha({
        reporter: resolved.reporter,
      }));
  };
  task.displayName = getTaskName();

  return task;
}

export function getTaskName(): string {
  return "_mocha:run";
}
