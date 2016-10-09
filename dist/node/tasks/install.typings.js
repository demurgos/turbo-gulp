"use strict";
var typings = require("typings-core");
exports.taskName = "install:typings";
function registerTask(gulp, locations, userOptions) {
    gulp.task(exports.taskName, function () {
        var options = {
            production: false,
            cwd: locations.config.project.root
        };
        return typings.install(options);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
