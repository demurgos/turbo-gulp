"use strict";
var project_1 = require("../utils/project");
function bump(type, locations) {
    return project_1.getNextVersion(type, locations)
        .then(function (nextVersion) {
        return project_1.release(nextVersion, locations);
    });
}
function registerTask(gulp, locations, userOptions) {
    gulp.task("project.bump.major", function () {
        bump("major", locations);
    });
    gulp.task("project.bump.minor", function () {
        bump("minor", locations);
    });
    gulp.task("project.bump.patch", function () {
        bump("patch", locations);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
