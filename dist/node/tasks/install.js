"use strict";
var _ = require("lodash");
var installJspm = require("./install.jspm");
var installNpm = require("./install.npm");
var installTypings = require("./install.typings");
exports.taskName = "install";
var defaultInstall = {
    jspm: true,
    npm: true,
    typings: true
};
function registerTask(gulp, locations, userOptions) {
    var installOptions = _.merge({}, defaultInstall, userOptions);
    var installTasks = [];
    if (installOptions.jspm) {
        installTasks.push(installJspm.taskName);
        installJspm.registerTask(gulp, locations, userOptions || {});
    }
    if (installOptions.npm) {
        installTasks.push(installNpm.taskName);
        installNpm.registerTask(gulp, locations, userOptions || {});
    }
    if (installOptions.typings) {
        installTasks.push(installTypings.taskName);
        installTypings.registerTask(gulp, locations, userOptions || {});
    }
    gulp.task(exports.taskName, installTasks);
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
