"use strict";
var del = require("del");
exports.taskName = "clean:browser";
function registerTask(gulp, locations, options) {
    gulp.task(exports.taskName, function () {
        return del([locations.getBuildDirectory("browser"), locations.getBuildDirectory("systemjs")]);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
