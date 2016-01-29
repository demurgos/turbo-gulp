var path = require("path");
var Builder = require("systemjs-builder");
var build_browser_tsc_1 = require("./build.browser.tsc");
function registerTask(gulp, locations, options) {
    build_browser_tsc_1.default(gulp, locations, options);
    gulp.task("build.browser.systemjs", ["build.browser.tsc"], function () {
        var builder = new Builder(locations.config.project.root, locations.config.project.systemjsConfig);
        /*var browserDir = locations.getSrcBrowserDir();
        var browserMain = locations.getSrcBrowserMain();*/
        var relativeBrowserMain = "browser/main"; // path.relative(browserDir, browserMain);
        var systemDir = locations.getBuildDirectory("systemjs");
        var buildDir = locations.getBuildDirectory("browser");
        return builder
            .build(path.resolve(systemDir, relativeBrowserMain), path.resolve(buildDir, relativeBrowserMain));
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
