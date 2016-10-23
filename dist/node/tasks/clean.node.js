"use strict";
var del = require("del");
exports.taskName = "clean:node";
function registerTask(gulp, locations, options) {
    gulp.task(exports.taskName, function () {
        return del([locations.getBuildDirectory("node")]);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
