import { spawn } from "child_process";
import { posix as posixPath } from "path";
import Undertaker from "undertaker";
import UndertakerRegistry from "undertaker-registry";
import { CleanOptions } from "../options/clean";
import { CopyOptions } from "../options/copy";
import { CompilerOptionsJson } from "../options/tsc";
import { OutModules } from "../options/typescript";
import { ResolvedProject } from "../project";
import { AbsPosixPath, RelPosixPath } from "../types";
import {
  BaseTasks,
  nameTask,
  registerBaseTasks,
  ResolvedBaseDependencies,
  ResolvedTargetBase,
  resolveTargetBase,
  TargetBase,
} from "./_base";

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
interface ResolvedNodeTarget extends NodeTarget, ResolvedTargetBase {
  readonly project: ResolvedProject;

  readonly srcDir: AbsPosixPath;

  readonly buildDir: AbsPosixPath;

  readonly scripts: Iterable<string>;

  readonly customTypingsDir: AbsPosixPath | null;

  readonly tscOptions: CompilerOptionsJson;

  readonly outModules: OutModules;

  readonly tsconfigJson: AbsPosixPath | null;

  readonly dependencies: ResolvedBaseDependencies;

  readonly copy?: CopyOptions[];

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
  const result: NodeTasks = <NodeTasks> registerBaseTasks(taker, targetOptions);

  const absMain: AbsPosixPath = posixPath.join(target.buildDir, `${target.mainModule}.js`);

  // run
  result.run = nameTask(`${target.name}:run`, () => {
    return spawn(
      "node",
      [absMain, ...process.argv.splice(1)],
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
    const task: Undertaker.TaskFunction | undefined = (<any> tasks)[key];
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
