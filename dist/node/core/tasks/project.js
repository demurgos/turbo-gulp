"use strict";
var project_lint_1 = require("./project.lint");
var project_bump_1 = require("./project.bump");
var project_dist_node_1 = require("./project.dist.node");
function registerTask(gulp, locations, userOptions) {
    project_lint_1.default(gulp, locations, userOptions);
    project_bump_1.default(gulp, locations, userOptions);
    project_dist_node_1.default(gulp, locations, userOptions);
    gulp.task("project", ["project.lint"]);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
