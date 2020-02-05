/**
 * This module defines the _node_ target type used to build runnable Node applications.
 *
 * In the following list of tasks, `{target}` represents the name of the target as defined by the `name` property
 * of the target options.
 * The _lib_ target provides the following tasks:
 *
 * ## {target}
 *
 * Build and run the target.
 *
 * ## {target}:build
 *
 * Performs a full build of the application to the build directory.
 *
 * ## {target}:run
 *
 * Run the the Node application (without building it).
 *
 * @module targets/node
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { spawn } from "child_process";
import { Furi, join as furiJoin } from "furi";
import Undertaker from "undertaker";
import UndertakerRegistry from "undertaker-registry";
import { CleanOptions } from "../options/clean";
import { CopyOptions } from "../options/copy";
import { TscOptions } from "../options/tsc";
import { ResolvedProject } from "../project";
import { RelPosixPath } from "../types";
import { MatcherUri } from "../utils/matcher";
import {
  BaseTasks,
  nameTask,
  registerBaseTasks,
  ResolvedBaseDependencies,
  ResolvedTargetBase,
  resolveTargetBase,
  TargetBase,
} from "./base";

/**
 * Represents a Node program.
 * This is compatible with both browsers and Node.
 */
export interface NodeTarget extends TargetBase {
  /**
   * Relative path for the main module (entry point of the lib) WITHOUT EXTENSION, relative to `project.srcDir`.
   * Default: `"index"`.
   */
  mainModule: RelPosixPath;
}

/**
 * Node target with fully resolved paths and dependencies.
 */
interface ResolvedNodeTarget extends ResolvedTargetBase {
  /**
   * Relative path for the main module (entry point of the lib) WITHOUT EXTENSION, relative to `project.srcDir`.
   * Default: `"index"`.
   */
  readonly mainModule: RelPosixPath;

  readonly project: ResolvedProject;

  readonly srcDir: Furi;

  readonly buildDir: Furi;

  readonly scripts: Iterable<MatcherUri>;

  readonly tscOptions: TscOptions;

  readonly tsconfigJson: Furi;

  readonly dependencies: ResolvedBaseDependencies;

  readonly copy?: ReadonlyArray<CopyOptions>;

  readonly clean?: CleanOptions;
}

/**
 * Resolve absolute paths and dependencies for the provided target.
 *
 * @param target Non-resolved target.
 * @return Resolved target.
 */
function resolveLibTarget(target: NodeTarget): ResolvedNodeTarget {
  const base: ResolvedTargetBase = resolveTargetBase(target);
  return {...base, mainModule: target.mainModule};
}

export interface NodeTasks extends BaseTasks {
  run: Undertaker.TaskFunction;
  start: Undertaker.TaskFunction;
}

/**
 * Generates and registers gulp tasks for the provided node target.
 *
 * @param taker Undertaker (or Gulp) registry used to generate tasks.
 * @param targetOptions Target configuration.
 */
export function generateNodeTasks(taker: Undertaker, targetOptions: NodeTarget): NodeTasks {
  const target: ResolvedNodeTarget = resolveLibTarget(targetOptions);
  const result: NodeTasks = registerBaseTasks(taker, targetOptions) as NodeTasks;

  const absMain: Furi = furiJoin(target.buildDir, `${target.mainModule}.js`);

  // run
  result.run = nameTask(`${target.name}:run`, () => {
    return spawn(
      process.execPath,
      [absMain.toSysPath(), ...process.argv.splice(1)],
      {stdio: "inherit"},
    );
  });

  // start
  const startTasks: Undertaker.TaskFunction[] = [];
  if (result.clean !== undefined) {
    startTasks.push(result.clean);
  }
  startTasks.push(result.build);
  startTasks.push(result.run);
  result.start = nameTask(target.name, taker.series(startTasks));

  return result;
}

/**
 * Generates and registers gulp tasks for the provided node target.
 *
 * @param taker Undertaker (or Gulp) instance where the tasks will be registered.
 * @param targetOptions Target configuration.
 */
export function registerNodeTasks(taker: Undertaker, targetOptions: NodeTarget): NodeTasks {
  const tasks: NodeTasks = generateNodeTasks(taker, targetOptions);
  for (const key in tasks) {
    const task: Undertaker.TaskFunction | undefined = (tasks as any)[key];
    if (task !== undefined) {
      taker.task(task);
    }
  }
  return tasks;
}

export class NodeRegistry extends UndertakerRegistry {
  private readonly options: NodeTarget;

  constructor(options: NodeTarget) {
    super();
    this.options = options;
  }

  init(taker: Undertaker): void {
    registerNodeTasks(taker, this.options);
  }
}
