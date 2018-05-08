import * as projectTasks from "./project-tasks/index";

export { projectTasks };

export { CleanOptions } from "./options/clean";
export { CopyOptions } from "./options/copy";
export { DEV_TSC_OPTIONS, PROD_TSC_OPTIONS, CompilerOptionsJson } from "./options/tsc";
export {
  DEFAULT_TYPED_TSLINT_CONFIG,
  DEFAULT_TYPED_TSLINT_RULES,
  DEFAULT_UNTYPED_TSLINT_CONFIG,
  DEFAULT_UNTYPED_TSLINT_RULES,
  TslintOptions,
} from "./options/tslint";
export { OutModules, TypescriptOptions } from "./options/typescript";
export { DEFAULT_PROJECT, Project } from "./project";
export {
  Target,
} from "./targets";
export { generateLibTasks, LibTarget, registerLibTasks } from "./targets/lib";
export { generateMochaTasks, MochaTarget, registerMochaTasks } from "./targets/mocha";
export { generateNodeTasks, NodeTarget, registerNodeTasks } from "./targets/node";
export { PackageJson } from "./utils/project";
