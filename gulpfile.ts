import * as buildTools from "demurgos-web-build-tools"; // Going meta
// import * as buildTools from "./build/lib/lib/index";
import * as gulp from "gulp";
import * as typescript from "typescript";

// Project-wide options
const projectOptions: buildTools.config.ProjectOptions = {
  ...buildTools.config.DEFAULT_PROJECT_OPTIONS,
  root: __dirname,
  tslint: {
    files: ["src/**/*.ts", "!src/e2e/*/*/**/*.ts"],
  },
};

// `lib` target
const libTarget: buildTools.config.NodeTarget = {
  ...buildTools.config.LIB_TARGET,
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
      target: "es2015",
    },
    typescript: typescript,
    tsconfigJson: ["lib/tsconfig.json"],
  },
};

// `lib-es5` target
const es5Target: buildTools.config.NodeTarget = {
  ...buildTools.config.LIB_TARGET,
  name: "lib-es5",
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
      target: "es5",
    },
    typescript: typescript,
    tsconfigJson: ["lib/es5.tsconfig.json"],
  },
};

// `lib-test` target
const libTestTarget: buildTools.config.TestTarget = {
  ...buildTools.config.LIB_TEST_TARGET,
  name: "lib-test",
  scripts: ["test/**/*.ts", "lib/**/*.ts", "e2e/*/*.ts"],
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
      target: "es2015",
    },
    typescript: typescript,
    tsconfigJson: ["test/tsconfig.json"],
  },
  copy: [
    {
      name: "e2e",
      src: "e2e",
      // <project-name>/(project|test-resources)/<any>
      files: ["*/project/**/*", "*/test-resources/**/*"],
      dest: "e2e",
    },
  ],
};

buildTools.projectTasks.registerAll(gulp, projectOptions);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, libTarget);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, es5Target);
buildTools.targetGenerators.test.generateTarget(gulp, projectOptions, libTestTarget);

gulp.task("all:tsconfig.json", gulp.parallel("lib:tsconfig.json", "lib-test:tsconfig.json"));
gulp.task("all:dist", gulp.parallel("lib:dist", "lib-es5:dist"));
