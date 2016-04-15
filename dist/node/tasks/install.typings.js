"use strict";
var typings = require("typings");
function registerTask(gulp, locations, userOptions) {
    gulp.task("install.typings", function () {
        return typings.install({ production: false, cwd: locations.config.project.root });
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
