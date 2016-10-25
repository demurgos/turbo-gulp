"use strict";
const installNpm = require("./install.npm");
const installTypings = require("./install.typings");
exports.taskName = "install";
function registerTask(gulp, options) {
    const installTasks = [];
    if (!(options.install && options.install.npm === false)) {
        installTasks.push(installNpm.taskName);
        installNpm.registerTask(gulp, options);
    }
    if (!(options.install && options.install.typings === false)) {
        installTasks.push(installTypings.taskName);
        installTypings.registerTask(gulp, options);
    }
    gulp.task(exports.taskName, installTasks);
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
