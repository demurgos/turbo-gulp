import * as projectTasks from "./project-tasks/index";

export { projectTasks };

export { CleanOptions } from "./options/clean";
export { CopyOptions } from "./options/copy";
export { DEV_TSC_OPTIONS, PROD_TSC_OPTIONS, TscOptions } from "./options/tsc";
export {
  DEFAULT_TYPED_TSLINT_CONFIG,
  DEFAULT_TYPED_TSLINT_RULES,
  DEFAULT_UNTYPED_TSLINT_CONFIG,
  DEFAULT_UNTYPED_TSLINT_RULES,
  TslintOptions,
} from "./options/tslint";
export { TypescriptOptions } from "./options/typescript";
export { DEFAULT_PROJECT, Project } from "./project";
export { Target } from "./target";
export { PackageJson } from "./utils/project";
