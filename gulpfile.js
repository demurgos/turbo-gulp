"use strict";

const gulp = require("gulp");
const typescript = require("typescript");
const buildTools = require("demurgos-web-build-tools"); // Going meta

const projectOptions = buildTools.config.DEFAULT_PROJECT_OPTIONS;
const libTarget = buildTools.config.LIB_TARGET;

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
