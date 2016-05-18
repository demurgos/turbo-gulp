'use strict';

var path = require('path');
var gulp = require('gulp');
var typescript = require('typescript');
var buildTools = require('./dist/node/main');

var locations = new buildTools.config.Locations({
  root: path.resolve(__dirname),
  core: {
    base: "src",
    typescript: ["**/*.ts", "!platform/**/*.ts"],
    definitions: ["../typings/**/*.d.ts"]
  },
  targets: {
    node: {
      base: "src/platform/node",
      typescript: ["**/*.ts"],
      main: "main",
      definitions: []
    }
  }
});

buildTools.tasks.build(gulp, locations, {tsc: {typescript: typescript}});
buildTools.tasks.install(gulp, locations);
buildTools.tasks.project(gulp, locations);
buildTools.tasks.test(gulp, locations);
