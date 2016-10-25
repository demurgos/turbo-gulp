"use strict";
const config = require("./config/config");
exports.config = config;
const projectTasks = require("./project-tasks/index");
exports.projectTasks = projectTasks;
const targetGenerators = require("./target-generators/index");
exports.targetGenerators = targetGenerators;
