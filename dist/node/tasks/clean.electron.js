"use strict";
var del = require("del");
exports.taskName = "clean:electron";
function registerTask(gulp, locations, options) {
    gulp.task(exports.taskName, function () {
        return del([locations.getBuildDirectory("electron")]);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
