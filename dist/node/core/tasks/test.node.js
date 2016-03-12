"use strict";
var path = require("path");
var mocha = require("gulp-mocha");
function registerTask(gulp, locations, options) {
    gulp.task("test.node", ["build.node-test"], function () {
        return gulp
            .src([path.join(locations.getCoverageDirectory("node"), "**/*.spec.js")], { base: locations.getCoverageDirectory("node") })
            .pipe(mocha({
            reporter: "spec"
        }));
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
