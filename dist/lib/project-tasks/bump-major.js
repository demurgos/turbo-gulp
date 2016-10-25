"use strict";
const project_1 = require("../utils/project");
exports.taskName = "project:bump-major";
function registerTask(gulp, { project }) {
    gulp.task(exports.taskName, function () {
        project_1.bumpVersion("major", project);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
