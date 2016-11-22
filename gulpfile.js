"use strict";

const gulp = require("gulp");
const typescript = require("typescript");

const useDist = false;

const buildTools = (useDist
  ? require("./dist/lib/lib/index")
  : require("demurgos-web-build-tools")); // Going meta

const projectOptions = buildTools.config.DEFAULT_PROJECT_OPTIONS;
const libTarget = buildTools.config.LIB_TARGET;
const libTestTarget = buildTools.config.LIB_TEST_TARGET;

buildTools.projectTasks.registerAll(gulp, {project: projectOptions, tslintOptions: {}, install: {}});

buildTools.targetGenerators.node.generateTarget(
  gulp,
  "lib",
  {
    project: projectOptions,
    target: libTarget,
    tsOptions: {
      typescript: typescript
    }
  }
);

if (buildTools.targetGenerators.test) {
  buildTools.targetGenerators.test.generateTarget(
    gulp,
    "lib-test",
    {
      project: projectOptions,
      target: libTestTarget,
      tsOptions: {
        typescript: typescript
      }
    }
  );
} else {
  gulp.task("lib-test", []);
  gulp.task("lib-test:clean", []);
  gulp.task("lib:dist", ["dist:lib"]);
  gulp.task(":lint", ["project:lint"]);
}
