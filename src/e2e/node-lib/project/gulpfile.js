// Sample gulpfile
const gulp = require("gulp");
const typescript = require("typescript");
const buildTools = require("./local-web-build-tools");

// Project-wide options
const projectOptions = Object.assign(
  {},
  buildTools.DEFAULT_PROJECT,
  {
    root: __dirname
  }
);

// Node library
const libTarget = Object.assign(
  {},
  buildTools.LIB_TARGET,
  {
    typescript: {
      compilerOptions: {
        skipLibCheck: true,
        target: "es2015"
      },
      typescript: typescript,
      strict: true,
      tsconfigJson: ["lib/tsconfig.json"]
    }
  }
);

// Browser version
const libES5Target = Object.assign(
  {},
  buildTools.LIB_TARGET,
  {
    name: "lib-es5",
    typescript: {
      compilerOptions: {
        skipLibCheck: true,
        target: "es5"
      },
      typescript: typescript,
      strict: true,
      tsconfigJson: ["lib/es5.tsconfig.json"]
    }
  }
);

// Browser version
const testTarget = Object.assign(
  {},
  buildTools.LIB_TEST_TARGET,
  {
    typescript: {
      compilerOptions: {
        skipLibCheck: true
      },
      typescript: typescript,
      tsconfigJson: ["test/tsconfig.json"]
    }
  }
);

buildTools.projectTasks.registerAll(gulp, projectOptions);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, libTarget);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, libES5Target);
buildTools.targetGenerators.test.generateTarget(gulp, projectOptions, testTarget);
