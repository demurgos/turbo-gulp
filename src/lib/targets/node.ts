import {spawn} from "child_process";
import {Gulp, TaskFunction} from "gulp";
import {posix as posixPath} from "path";
import {CleanOptions} from "../options/clean";
import {CopyOptions} from "../options/copy";
import {CompilerOptionsJson} from "../options/tsc";
import {Project, ResolvedProject, resolveProject} from "../project";
import {AbsPosixPath, RelPosixPath} from "../types";
import {
  addTask,
  BaseTasks,
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
  readonly srcDir: AbsPosixPath;

  readonly buildDir: AbsPosixPath;

  readonly scripts: Iterable<string>;

  readonly customTypingsDir: AbsPosixPath | null;

  readonly tscOptions: CompilerOptionsJson;

  readonly tsconfigJson: AbsPosixPath | null;

  readonly dependencies: ResolvedBaseDependencies;

  readonly copy?: CopyOptions[];

  readonly clean?: CleanOptions;
}

/**
 * Resolve absolute paths and dependencies for the provided target.
 *
 * @param project Project to use.
 * @param target Non-resolved target.
 * @return Resolved target.
 */
function resolveLibTarget(project: ResolvedProject, target: NodeTarget): ResolvedNodeTarget {
  const base: ResolvedTargetBase = resolveTargetBase(project, target);
  return {...base, mainModule: target.mainModule};
}

export interface NodeTasks extends BaseTasks {
  run: TaskFunction;
  start: TaskFunction;
}

/**
 * Generates and registers gulp tasks for the provided node target.
 *
 * @param gulp Gulp instance where the tasks will be registered.
 * @param project Project configuration.
 * @param target Target configuration.
 */
export function registerNodeTargetTasks(gulp: Gulp, project: Project, target: NodeTarget): NodeTasks {
  const resolvedProject: ResolvedProject = resolveProject(project);
  const resolvedTarget: ResolvedNodeTarget = resolveLibTarget(resolvedProject, target);
  const result: NodeTasks = <NodeTasks> registerBaseTasks(gulp, project, target);

  const absMain: AbsPosixPath = posixPath.join(resolvedTarget.buildDir, `${resolvedTarget.mainModule}.js`);

  // run
  result.run = addTask(gulp, `${target.name}:run`, () => {
    return spawn(
      "node",
      [absMain, ...process.argv.splice(1)],
      {stdio: "inherit"},
    );
  });

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
