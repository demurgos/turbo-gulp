"use strict";
var path = require("path");
var mocha = require("gulp-mocha");
var buildNodeTest = require("./build.node-test");
exports.taskName = "test:node";
function registerTask(gulp, locations, userOptions) {
    buildNodeTest.registerTask(gulp, locations, userOptions || {});
    gulp.task(exports.taskName, [buildNodeTest.taskName], function () {
        return gulp
            .src([path.join(locations.getCoverageDirectory("node"), "**/*.spec.js")], { base: locations.getCoverageDirectory("node") })
            .pipe(mocha({
            reporter: "spec"
        }));
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
