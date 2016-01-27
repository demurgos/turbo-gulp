'use strict';

var path = require('path');
var gulp = require('gulp');
var typescript = require('typescript');
// var buildTools = require('old-build-tools');
var buildTools = require('./build/node/node/main');

var locations = new buildTools.config.Locations({
  root: path.resolve(__dirname)
});

buildTools.tasks.build(gulp, locations, {tsc: {typescript: typescript}});
buildTools.tasks.install(gulp, locations);
buildTools.tasks.project(gulp, locations);
buildTools.tasks.test(gulp, locations);
