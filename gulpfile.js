"use strict";

const buildTools = require("demurgos-web-build-tools"); // Going meta
const gulp = require("gulp");
const typescript = require("typescript");

// Project-wide options
const projectOptions = Object.assign(
  {},
  buildTools.config.DEFAULT_PROJECT_OPTIONS,
  {
    root: __dirname,
    tslintOptions: {
      files: ["src/**/*.ts", "!src/e2e/*/*/**/*.ts"]
    }
  }
);

// `lib` target
const libTarget = Object.assign(
  {},
  buildTools.config.LIB_TARGET,
  {
    typescript: {
      compilerOptions: {
        skipLibCheck: true
      },
      typescript: typescript,
      tsconfigJson: ["lib/tsconfig.json"]
    },
    typescriptOptions: {
      skipLibCheck: true,
      typescript: typescript
    }
  }
);

// `lib-es5` target
const es5Target = Object.assign(
  {},
  buildTools.config.LIB_TARGET,
  {
    name: "lib-es5",
    typescriptOptions: {
      skipLibCheck: true,
      typescript: typescript,
      target: "es5"
    }
  }
);

// // `lib-test` target
// const libTestTarget = Object.assign(
//   {},
//   buildTools.config.LIB_TEST_TARGET,
//   {
//     name: "lib-es5",
//     scripts: ["test/**/*.ts", "lib/**/*.ts", "e2e/*/*.ts"],
//     typescriptOptions: {
//       skipLibCheck: true,
//       typescript: typescript
//     },
//     copy: [
//       {
//         name: "e2e",
//         src: "e2e",
//         // <project-name>/(project|test-resources)/<any>
//         files: ["*/project/**/*", "*/test-resources/**/*"],
//         dest: "e2e"
//       }
//     ]
//   }
// );

const libTestTarget = buildTools.config.LIB_TEST_TARGET;
libTestTarget.scripts = ["test/**/*.ts", "lib/**/*.ts", "e2e/*/*.ts"];
libTestTarget.copy = [
  {
    name: "projects",
    src: "e2e",
    // <project-name>/(project|test-resources)/<any>
    files: ["*/project/**/*", "*/test-resources/**/*"],
    dest: "e2e"
  }
];

buildTools.projectTasks.registerAll(gulp, projectOptions);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, libTarget);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, es5Target);
// buildTools.targetGenerators.test.generateTarget(gulp, projectOptions, libTestTarget);
buildTools.targetGenerators.test.generateTarget(
  gulp,
  "lib-test",
  {
    project: projectOptions,
    target: libTestTarget,
    tsOptions: {
      typescript: typescript,
      skipLibCheck: true
    }
  }
);
