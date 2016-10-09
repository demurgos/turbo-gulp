"use strict";
var buildNodeTsc = require("./build.node.tsc");
exports.taskName = "build:node";
function registerTask(gulp, locations, options) {
    buildNodeTsc.registerTask(gulp, locations, options || {});
    gulp.task(exports.taskName, [buildNodeTsc.taskName]);
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
