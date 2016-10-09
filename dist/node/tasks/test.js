"use strict";
var testNode = require("./test.node");
exports.taskName = "test";
function registerTask(gulp, locations, options) {
    testNode.registerTask(gulp, locations, options || {});
    gulp.task(exports.taskName, [testNode.taskName]);
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
