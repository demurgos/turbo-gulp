var _ = require("lodash");
var build_node_1 = require("./build.node");
var build_node_test_1 = require("./build.node-test");
var build_browser_1 = require("./build.browser");
var defaultBuilds = {
    node: true,
    browser: true
};
function registerTask(gulp, locations, userOptions) {
    var buildOptions = _.assign({}, defaultBuilds, userOptions);
    var buildTasks = [];
    if (buildOptions.node) {
        buildTasks.push("build.node");
        build_node_1.default(gulp, locations, userOptions);
        buildTasks.push("build.node-test");
        build_node_test_1.default(gulp, locations, userOptions);
    }
    if (buildOptions.browser) {
        buildTasks.push("build.browser");
        build_browser_1.default(gulp, locations, userOptions);
    }
    gulp.task("build", buildTasks);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
