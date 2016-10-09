"use strict";
var path = require("path");
var gulp_tslint_1 = require("gulp-tslint");
var tslint = require("tslint");
var tslint_1 = require("../config/tslint");
exports.taskName = "project:lint";
function registerTask(gulp, locations, userOptions) {
    gulp.task(exports.taskName, function () {
        var sourcesDir = path.join(locations.config.project.root, locations.config.project.sources);
        gulp.src(path.join(sourcesDir, "**/*.ts"), { base: sourcesDir })
            .pipe(gulp_tslint_1.default({
            configuration: tslint_1.default,
            formatter: "verbose",
            tslint: tslint
        }))
            .pipe(gulp_tslint_1.default.report());
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
