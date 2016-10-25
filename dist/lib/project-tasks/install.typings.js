"use strict";
const typings = require("typings-core");
exports.taskName = "install:typings";
function registerTask(gulp, { project }) {
    gulp.task(exports.taskName, function () {
        const options = {
            production: false,
            cwd: project.root
        };
        return typings.install(options);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
