"use strict";
var jspm = require("jspm");
exports.taskName = "install:jspm";
function registerTask(gulp, locations, userOptions) {
    gulp.task(exports.taskName, function () {
        jspm.setPackagePath(locations.config.project.root);
        return jspm.install(true);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
