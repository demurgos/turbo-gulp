"use strict";
var path = require("path");
var Builder = require("systemjs-builder");
var build_browser_tsc_1 = require("./build.browser.tsc");
function registerTask(gulp, locations, options) {
    build_browser_tsc_1.default(gulp, locations, options);
    gulp.task("build.browser.systemjs", ["build.browser.tsc"], function () {
        var root = locations.config.project.root;
        var builder = new Builder(".", path.relative(root, locations.config.project.systemjsConfig));
        var relativeBrowserMain = "browser/main.js"; // path.relative(browserDir, browserMain);
        var systemDir = locations.getBuildDirectory("systemjs");
        var buildDir = locations.getBuildDirectory("browser");
        var relativeInput = path.relative(root, path.resolve(systemDir, relativeBrowserMain));
        var relativeOutput = path.relative(root, path.resolve(buildDir, relativeBrowserMain));
        return builder
            .buildStatic(relativeInput, relativeOutput);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
