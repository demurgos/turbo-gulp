"use strict";
var path = require("path");
var _ = require("lodash");
var tsc = require("gulp-typescript");
var merge = require("merge2");
var tsc_1 = require("../config/tsc");
exports.taskName = "build:node:tsc";
function registerTask(gulp, locations, options) {
    var tscConfig = _.assign({}, tsc_1.default, options.tsc, {target: "es6"});
    gulp.task(exports.taskName, function () {
        var tsResult = gulp
            .src(locations.getTypescriptSources("node", true), {
            base: path.join(locations.config.project.root, locations.config.project.sources)
        })
            .pipe(tsc(tscConfig));
        return merge([
            // tsResult.dts.pipe(gulp.dest(locs.definitions)),
            tsResult.dts.pipe(gulp.dest(locations.getBuildDirectory("node"))),
            tsResult.js.pipe(gulp.dest(locations.getBuildDirectory("node")))
        ]);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
