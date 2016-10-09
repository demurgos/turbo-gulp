"use strict";
var path = require("path");
var buildNode = require("./build.node");
exports.taskName = "project:dist:node";
function registerTask(gulp, locations, userOptions) {
    buildNode.registerTask(gulp, locations, userOptions || {});
    gulp.task(exports.taskName, [buildNode.taskName], function () {
        return gulp
            .src([path.join(locations.getBuildDirectory("node"), "**/*")], { base: locations.getBuildDirectory("node") })
            .pipe(gulp.dest(locations.getDistDirectory("node")));
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
