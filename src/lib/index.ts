import * as projectTasks from "./project-tasks/index";
import * as targetGenerators from "./target-generators/index";
import * as taskGenerators from "./task-generators/index";

export {projectTasks, targetGenerators, taskGenerators};

export {CleanOptions} from "./options/clean";
export {CopyOptions} from "./options/copy";
export {PugOptions} from "./options/pug";
export {SassOptions} from "./options/sass";
export {DEV_TSC_OPTIONS, PROD_TSC_OPTIONS, CompilerOptionsJson} from "./options/tsc";
export {
  DEFAULT_TYPED_TSLINT_CONFIG,
  DEFAULT_TYPED_TSLINT_RULES,
  DEFAULT_UNTYPED_TSLINT_CONFIG,
  DEFAULT_UNTYPED_TSLINT_RULES,
  TslintOptions,
} from "./options/tslint";
export {TypescriptOptions} from "./options/typescript";
export {DEFAULT_PROJECT, Project} from "./project";
export {
  ANGULAR_CLIENT_TARGET,
  ANGULAR_SERVER_TARGET,
  LIB_TARGET,
  LIB_TEST_TARGET,
  NodeTarget,
  Target,
  TestTarget,
  WebpackTarget,
} from "./targets";
export {LibTarget, registerLibTargetTasks} from "./targets/lib";
