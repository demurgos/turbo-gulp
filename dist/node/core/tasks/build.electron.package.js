"use strict";
var path = require("path");
function registerTask(gulp, locations, options) {
    gulp.task("build.electron.package", function () {
        var electronSrc = locations.getSourceDirectory("electron");
        var packageInput = path.resolve(electronSrc, "package.json");
        return gulp.src([packageInput], { base: electronSrc })
            .pipe(gulp.dest(locations.getBuildDirectory("electron")));
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
