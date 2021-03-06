/**
 * This module defines the `tsconfig-json` project task.
 *
 * @module project-tasks/tsconfig-json
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Furi, join as furiJoin } from "furi";
import { default as Undertaker, TaskFunction } from "undertaker";
import {
  CustomTscOptions,
  DEFAULT_TSC_OPTIONS,
  mergeTscOptions,
  toStandardTscOptions,
  TscOptions,
} from "../options/tsc";
import { ResolvedProject } from "../project";
import { writeJsonFile } from "../utils/project";

export interface Options {
  /**
   * The absolute path where to generate the project tsconfigJson file.
   */
  readonly tsconfigJson: Furi;

  /**
   * The compiler options to apply, merged with the default project compiler options.
   *
   * Custom compiler options (such as `mjsModule`) will be removed.
   */
  readonly tscOptions?: CustomTscOptions;
}

export function generateTask(options: Options): TaskFunction {
  const compilerOptions: TscOptions = toStandardTscOptions(mergeTscOptions(DEFAULT_TSC_OPTIONS, options.tscOptions));

  const task: TaskFunction = async function () {
    return writeJsonFile(options.tsconfigJson, {compilerOptions});
  };

  task.displayName = getTaskName();
  return task;
}

export function getTaskName(): string {
  return "tsconfig.json";
}

export function registerTask(taker: Undertaker, project: ResolvedProject): TaskFunction {
  if (project.typescript === undefined || project.typescript.tsconfigJson === undefined) {
    throw new Error("Cannot register project tsconfigJson task, missing required properties options");
  }

  const subTasks: TaskFunction[] = [];

  for (const tsconfigPath of project.typescript.tsconfigJson) {
    const tsconfigJson: Furi = furiJoin(project.absRoot, [tsconfigPath]);
    const tscOptions: TscOptions | undefined = project.typescript.tscOptions;
    const subTask: TaskFunction = generateTask({tsconfigJson, tscOptions});
    subTask.displayName = `_tsconfig.json:${tsconfigPath}`;
    subTasks.push(subTask);
  }

  const mainTask: TaskFunction = taker.parallel(...subTasks);
  mainTask.displayName = getTaskName();
  taker.task(mainTask.displayName, mainTask);
  return mainTask;
}
