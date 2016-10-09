"use strict";
var _ = require("lodash");
var buildNode = require("./build.node");
var buildNodeTest = require("./build.node-test");
var buildBrowser = require("./build.browser");
var buildElectron = require("./build.electron");
exports.taskName = "build";
var defaultBuilds = {
    node: true,
    browser: true,
    electron: true
};
function registerTask(gulp, locations, userOptions) {
    var buildOptions = _.assign({}, defaultBuilds, userOptions);
    var buildTasks = [];
    if (buildOptions.node) {
        buildTasks.push(buildNode.taskName);
        buildNode.registerTask(gulp, locations, userOptions);
        buildTasks.push(buildNodeTest.taskName);
        buildNodeTest.registerTask(gulp, locations, userOptions);
    }
    if (buildOptions.browser) {
        buildTasks.push(buildBrowser.taskName);
        buildBrowser.registerTask(gulp, locations, userOptions);
    }
    if (buildOptions.electron) {
        buildTasks.push(buildElectron.taskName);
        buildElectron.registerTask(gulp, locations, userOptions);
    }
    gulp.task(exports.taskName, buildTasks);
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
