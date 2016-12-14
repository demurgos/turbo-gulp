// Sample gulpfile
const gulp = require("gulp");
const buildTools = require("./local-web-build-tools");

const projectOptions = buildTools.config.DEFAULT_PROJECT_OPTIONS;
projectOptions.root = __dirname;

buildTools.projectTasks.registerAll(gulp, {
  project: projectOptions,
  tslintOptions: {},
  install: {}
});
