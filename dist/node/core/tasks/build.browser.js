var build_browser_systemjs_1 = require("./build.browser.systemjs");
function registerTask(gulp, locations, options) {
    build_browser_systemjs_1.default(gulp, locations, options);
    gulp.task("build.browser", ["build.browser.systemjs"]);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
