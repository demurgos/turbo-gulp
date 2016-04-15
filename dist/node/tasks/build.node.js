"use strict";
var build_node_tsc_1 = require("./build.node.tsc");
function registerTask(gulp, locations, options) {
    build_node_tsc_1.default(gulp, locations, options || {});
    gulp.task("build.node", ["build.node.tsc"]);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
