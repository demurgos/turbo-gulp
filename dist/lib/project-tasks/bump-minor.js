"use strict";
const project_1 = require("../utils/project");
exports.taskName = "project:bump-minor";
function registerTask(gulp, { project }) {
    gulp.task(exports.taskName, function () {
        project_1.bumpVersion("minor", project);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
