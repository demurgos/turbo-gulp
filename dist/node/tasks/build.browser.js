"use strict";
var buildBrowserSystemjs = require("./build.browser.systemjs");
exports.taskName = "build:browser";
function registerTask(gulp, locations, options) {
    buildBrowserSystemjs.registerTask(gulp, locations, options || {});
    gulp.task(exports.taskName, [buildBrowserSystemjs.taskName]);
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
