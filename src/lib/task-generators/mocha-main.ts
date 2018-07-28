import { TaskFunction } from "undertaker";
import { requireAll, RequireAllOptions } from "../require-all";

const DEFAULT_MOCHA_MAIN_TASK_NAME: string = "_:build:mocha-main";

// TODO: Remove `suffix` from the options at this level
export function generateMochaMainTask(options: RequireAllOptions): TaskFunction {
  const task: TaskFunction = async function (): Promise<void> {
    return requireAll({suffix: options.mode === "esm" ? "  run();" : undefined, ...options});
  };
  task.displayName = DEFAULT_MOCHA_MAIN_TASK_NAME;

  return task;
}
