'use strict';

const path = require('path');
const gulp = require('gulp');
const typescript = require('typescript');
const buildTools = require('via-build-tools'); // Going meta

const projectOptions = buildTools.config.DEFAULT_CONFIG;
const libTarget = buildTools.config.LIB_TARGET;

buildTools.projectTasks.registerAll(gulp, {project: projectOptions, tslintOptions: {}, install: {}});

buildTools.targetGenerators.node.generateTarget(gulp, "lib", {project: projectOptions, target: libTarget});

// var locations = new buildTools.config.Locations({
//   root: path.resolve(__dirname),
//   core: {
//     base: "src/lib",
//     typescript: ["**/*.ts"],
//     definitions: ["../../typings/**/*.d.ts"]
//   },
//   targets: {
//     node: {
//       base: "src/lib",
//       typescript: ["**/*.ts"],
//       main: "main",
//       definitions: []
//     },
//     test: null
//   }
// });
//
// buildTools.tasks.build(gulp, locations, {tsc: {typescript: typescript, target: "es6", lib: ["es6"]}});
// buildTools.tasks.clean(gulp, locations);
// buildTools.tasks.install(gulp, locations);
// buildTools.tasks.project(gulp, locations);
// buildTools.tasks.test(gulp, locations);
