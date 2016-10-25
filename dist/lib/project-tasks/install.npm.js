"use strict";
const install = require("gulp-install");
exports.taskName = "install:npm";
function registerTask(gulp, { project }) {
    gulp.task(exports.taskName, function () {
        return gulp.src([project.package])
            .pipe(install());
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
