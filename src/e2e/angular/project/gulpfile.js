"use strict";

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

// Angular universal server target
// This will look better with ES7 object spread:
// const serverTarget = {...buildTools.config.ANGULAR_SERVER_TARGET, name: "foo", scripts: ["bar/*.ts"]}
const serverTarget = Object.assign(
  {},
  buildTools.config.ANGULAR_SERVER_TARGET,
  {
    typescriptOptions: {
      skipLibCheck: true,
      typescript: typescript,
      lib: ["es6", "dom"]
    },
    pug: buildTools.config.ANGULAR_SERVER_TARGET.pug
      .map(config => Object.assign({}, config, {
        options: {locals: {locale: "en_US"}}
      }))
  }
);

buildTools.projectTasks.registerAll(gulp, projectOptions);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, serverTarget);
