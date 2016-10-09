"use strict";
var buildNodeTestTsc = require("./build.node-test.tsc");
exports.taskName = "build:node-test";
function registerTask(gulp, locations, options) {
    buildNodeTestTsc.registerTask(gulp, locations, options || {});
    gulp.task(exports.taskName, [buildNodeTestTsc.taskName]);
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
