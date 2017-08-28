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
  Target,
  WebpackTarget,
} from "./targets";
export {generateLibTasks, LibTarget, registerLibTargetTasks} from "./targets/lib";
export {generateMochaTargetTasks, MochaTarget, registerMochaTargetTasks} from "./targets/mocha";
export {generateNodeTargetTasks, NodeTarget, registerNodeTargetTasks} from "./targets/node";
export {PackageJson} from "./utils/project";
