"use strict";
var typings = require("typings-core");
function registerTask(gulp, locations, userOptions) {
    gulp.task("install.typings", function () {
        var options = {
            production: false,
            cwd: locations.config.project.root
        };
        return typings.install(options);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
