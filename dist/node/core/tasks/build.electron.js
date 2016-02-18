var build_electron_tsc_1 = require("./build.electron.tsc");
var build_electron_browser_1 = require("./build.electron.browser");
var build_electron_package_1 = require("./build.electron.package");
function registerTask(gulp, locations, options) {
    build_electron_tsc_1.default(gulp, locations, options || {});
    build_electron_browser_1.default(gulp, locations, options || {});
    build_electron_package_1.default(gulp, locations, options || {});
    gulp.task("build.electron", ["build.electron.tsc", "build.electron.browser", "build.electron.package"]);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
