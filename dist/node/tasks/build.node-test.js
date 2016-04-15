"use strict";
var build_node_test_tsc_1 = require("./build.node-test.tsc");
function registerTask(gulp, locations, options) {
    build_node_test_tsc_1.default(gulp, locations, options || {});
    gulp.task("build.node-test", ["build.node-test.tsc"]);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
