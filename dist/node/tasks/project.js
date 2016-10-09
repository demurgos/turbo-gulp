"use strict";
var projectLint = require("./project.lint");
var projectBumpMajor = require("./project.bump-major");
var projectBumpMinor = require("./project.bump-minor");
var projectBumpPatch = require("./project.bump-patch");
var projectDistNode = require("./project.dist.node");
exports.taskName = "project";
function registerTask(gulp, locations, userOptions) {
    projectLint.registerTask(gulp, locations, userOptions);
    projectBumpMajor.registerTask(gulp, locations, userOptions);
    projectBumpMinor.registerTask(gulp, locations, userOptions);
    projectBumpPatch.registerTask(gulp, locations, userOptions);
    projectDistNode.registerTask(gulp, locations, userOptions);
    gulp.task(exports.taskName, [projectLint.taskName]);
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
