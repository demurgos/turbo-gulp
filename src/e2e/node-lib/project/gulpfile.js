// Sample gulpfile
const gulp = require("gulp");
const typescript = require("typescript");
const buildTools = require("./local-web-build-tools");

// Project-wide options
const projectOptions = Object.assign(
  {},
  buildTools.config.DEFAULT_PROJECT_OPTIONS,
  {
    root: __dirname
  }
);

// Node library
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
      strict: true
    }
  }
);

// Browser version
const libES5Target = Object.assign(
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
      strict: true
    }
  }
);

// Browser version
const testTarget = Object.assign(
  {},
  buildTools.config.LIB_TEST_TARGET,
  {
    typescript: {
      compilerOptions: {
        skipLibCheck: true
      },
      typescript: typescript
    }
  }
);

buildTools.projectTasks.registerAll(gulp, projectOptions);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, libTarget);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, libES5Target);
buildTools.targetGenerators.test.generateTarget(gulp, projectOptions, testTarget);
