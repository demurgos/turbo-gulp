import * as buildTools from "demurgos-web-build-tools"; // Going meta
// import * as buildTools from "./build/lib/lib/index";

import * as gulp from "gulp";
import * as typescript from "typescript";

// Project-wide options
const projectOptions: buildTools.Project = {
  ...buildTools.DEFAULT_PROJECT,
  root: __dirname,
  tslint: {
    files: ["src/**/*.ts", "!src/e2e/*/*/**/*.ts"],
  },
  typescript: {
    tsconfigJson: ["tsconfig.json"],
    compilerOptions: {
      typeRoots: [
        "src/custom-typings",
        "node_modules/@types",
      ],
    },
  },
};

// `lib` target
const libTarget: buildTools.NodeTarget = {
  ...buildTools.LIB_TARGET,
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
      target: "es2015",
    },
    typescript: typescript,
    tsconfigJson: ["tsconfig.json"],
  },
};

// `lib-test` target
const libTestTarget: buildTools.TestTarget = {
  ...buildTools.LIB_TEST_TARGET,
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
buildTools.targetGenerators.test.generateTarget(gulp, projectOptions, libTestTarget);

gulp.task("all:tsconfig.json", gulp.parallel("lib:tsconfig.json", "lib-test:tsconfig.json"));
gulp.task("all:dist", gulp.parallel("lib:dist"));
