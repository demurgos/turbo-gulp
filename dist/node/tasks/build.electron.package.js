"use strict";
var path = require("path");
exports.taskName = "build:electron:package";
function registerTask(gulp, locations, options) {
    gulp.task(exports.taskName, function () {
        var electronSrc = locations.getSourceDirectory("electron");
        var packageInput = path.resolve(electronSrc, "package.json");
        return gulp.src([packageInput], { base: electronSrc })
            .pipe(gulp.dest(locations.getBuildDirectory("electron")));
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
