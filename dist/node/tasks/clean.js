"use strict";
var cleanBrowser = require("./clean.browser");
var cleanElectron = require("./clean.electron");
var cleanNode = require("./clean.node");
exports.taskName = "clean";
function registerTask(gulp, locations, options) {
    cleanBrowser.registerTask(gulp, locations, options || {});
    cleanElectron.registerTask(gulp, locations, options || {});
    cleanNode.registerTask(gulp, locations, options || {});
    gulp.task(exports.taskName, [cleanBrowser.taskName, cleanElectron.taskName, cleanNode.taskName]);
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
