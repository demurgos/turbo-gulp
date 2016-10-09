"use strict";
var project_1 = require("../utils/project");
exports.taskName = "project:bump-minor";
function registerTask(gulp, locations, userOptions) {
    gulp.task(exports.taskName, function () {
        project_1.bumpVersion("minor", locations);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
