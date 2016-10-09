"use strict";
var path = require("path");
var buildBrowser = require("./build.browser");
exports.taskName = "build:electron:browser";
function registerTask(gulp, locations, options) {
    buildBrowser.registerTask(gulp, locations, options || {});
    gulp.task(exports.taskName, [buildBrowser.taskName], function () {
        var browserInput = locations.getBuildDirectory("browser");
        var browserOutput = path.resolve(locations.getBuildDirectory("electron"), "browser");
        return gulp.src([path.resolve(browserInput, "**/*")], { base: browserInput })
            .pipe(gulp.dest(browserOutput));
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
