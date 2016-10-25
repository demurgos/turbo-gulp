"use strict";
const path_1 = require("path");
const lodash_1 = require("lodash");
const tsc = require("gulp-typescript");
const merge = require("merge2");
const tsc_1 = require("../config/tsc");
function registerTask(gulp, targetName, options) {
    const tscOptions = lodash_1.assign({}, tsc_1.DEV_TSC_OPTIONS, options.tscOptions);
    const task = function () {
        const tsResult = gulp
            .src(options.sources.map(source => path_1.resolve(options.baseDir, source)), { base: options.baseDir })
            .pipe(tsc(tscOptions));
        return merge([
            tsResult.dts.pipe(gulp.dest(options.buildDir)),
            tsResult.js.pipe(gulp.dest(options.buildDir))
        ]);
    };
    gulp.task(`build:${targetName}:scripts`, task);
    return task;
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
