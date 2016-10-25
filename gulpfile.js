'use strict';

var path = require('path');
var gulp = require('gulp');
var typescript = require('typescript');
var buildTools = require('./dist/node/main');

var locations = new buildTools.config.Locations({
  root: path.resolve(__dirname),
  core: {
    base: "src/lib",
    typescript: ["**/*.ts"],
    definitions: ["../../typings/**/*.d.ts"]
  },
  targets: {
    node: {
      base: "src/lib",
      typescript: ["**/*.ts"],
      main: "main",
      definitions: []
    },
    test: null
  }
});

buildTools.tasks.build(gulp, locations, {tsc: {typescript: typescript}});
buildTools.tasks.clean(gulp, locations);
buildTools.tasks.install(gulp, locations);
buildTools.tasks.project(gulp, locations);
buildTools.tasks.test(gulp, locations);
