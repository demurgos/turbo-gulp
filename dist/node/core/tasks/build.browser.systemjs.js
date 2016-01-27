var path = require('path');
var Builder = require('systemjs-builder');
var build_browser_tsc_1 = require('./build.browser.tsc');
function registerTask(gulp, locations, options) {
    build_browser_tsc_1.default(gulp, locations, options);
    gulp.task('build.browser.systemjs', ['build.browser.tsc'], function () {
        var builder = new Builder(locations.getRootDir(), locations.getSystemJSConfig());
        var fdi;
        var browserDir = locations.getSrcBrowserDir();
        var browserMain = locations.getSrcBrowserMain();
        var relativeBrowserMain = path.relative(browserDir, browserMain);
        var systemDir = locations.getBuildSystemJSDir();
        var buildDir = locations.getBuildBrowserDir();
        return builder
            .build(path.resolve(systemDir, relativeBrowserMain), path.resolve(buildDir, relativeBrowserMain));
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
