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
        skipLibCheck: true,
        target: "es2015"
      },
      typescript: typescript,
      tsconfigJson: ["lib/tsconfig.json"]
    }
  }
);

// `lib-es5` target
const es5Target = Object.assign(
  {},
  buildTools.config.LIB_TARGET,
  {
    name: "lib-es5",
    typescript: {
      compilerOptions: {
        skipLibCheck: true,
        target: "es5"
      },
      typescript: typescript,
      tsconfigJson: ["lib/es5.tsconfig.json"]
    }
  }
);

// `lib-test` target
const libTestTarget = Object.assign(
  {},
  buildTools.config.LIB_TEST_TARGET,
  {
    name: "lib-test",
    scripts: ["test/**/*.ts", "lib/**/*.ts", "e2e/*/*.ts"],
    typescript: {
      compilerOptions: {
        skipLibCheck: true,
        target: "es2015"
      },
      typescript: typescript,
      tsconfigJson: ["test/tsconfig.json"]
    },
    copy: [
      {
        name: "e2e",
        src: "e2e",
        // <project-name>/(project|test-resources)/<any>
        files: ["*/project/**/*", "*/test-resources/**/*"],
        dest: "e2e"
      }
    ]
  }
);

buildTools.projectTasks.registerAll(gulp, projectOptions);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, libTarget);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, es5Target);
buildTools.targetGenerators.test.generateTarget(gulp, projectOptions, libTestTarget);
