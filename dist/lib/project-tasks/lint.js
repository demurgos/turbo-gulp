"use strict";
const path_1 = require("path");
const tslint = require("tslint");
const gulp_tslint_1 = require("gulp-tslint");
const tslint_1 = require("../config/tslint");
exports.taskName = "project:lint";
function registerTask(gulp, { project, tslintOptions }) {
    const options = Object.assign({}, {
        configuration: tslint_1.default,
        formatter: "verbose",
        tslint: tslint
    }, tslintOptions);
    gulp.task(exports.taskName, function () {
        const srcDir = path_1.resolve(project.root, project.srcDir);
        const sources = path_1.resolve(srcDir, "**/*.ts");
        gulp.src([sources], { base: srcDir })
            .pipe(gulp_tslint_1.default(options))
            .pipe(gulp_tslint_1.default.report());
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
