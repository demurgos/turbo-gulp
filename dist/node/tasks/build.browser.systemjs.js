"use strict";
var path = require("path");
var Builder = require("systemjs-builder");
var buildBrowserTsc = require("./build.browser.tsc");
exports.taskName = "build:browser:systemjs";
function registerTask(gulp, locations, options) {
    buildBrowserTsc.registerTask(gulp, locations, options);
    gulp.task(exports.taskName, [buildBrowserTsc.taskName], function () {
        var root = locations.config.project.root;
        var builder = new Builder(".", path.relative(root, locations.config.project.systemjsConfig));
        var relativeBrowserMain = "browser/main.js"; // path.relative(browserDir, browserMain);
        var systemDir = locations.getBuildDirectory("systemjs");
        var buildDir = locations.getBuildDirectory("browser");
        var relativeInput = path.relative(root, path.resolve(systemDir, relativeBrowserMain));
        var relativeOutput = path.relative(root, path.resolve(buildDir, relativeBrowserMain));
        return builder.buildStatic(relativeInput, relativeOutput);
    });
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
