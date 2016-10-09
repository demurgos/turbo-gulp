"use strict";
var buildElectronTsc = require("./build.electron.tsc");
var buildElectronBrowser = require("./build.electron.browser");
var buildElectronPackage = require("./build.electron.package");
exports.taskName = "build:electron";
function registerTask(gulp, locations, options) {
    buildElectronTsc.registerTask(gulp, locations, options || {});
    buildElectronBrowser.registerTask(gulp, locations, options || {});
    buildElectronPackage.registerTask(gulp, locations, options || {});
    gulp.task(exports.taskName, [buildElectronTsc.taskName, buildElectronBrowser.taskName, buildElectronPackage.taskName]);
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
