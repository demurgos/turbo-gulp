var test_node_1 = require("./test.node");
function registerTask(gulp, locations, options) {
    test_node_1.default(gulp, locations, options || {});
    gulp.task("test", ["test.node"]);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
