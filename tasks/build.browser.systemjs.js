var path = require('path');

var _ = require('lodash');
var systemjsBuilder = require('systemjs-builder');

module.exports = function (gulp, locations, options) {

  require('./build.browser.tsc')(gulp, locations, options);

  gulp.task('build.browser.systemjs', ['build.browser.tsc'], function () {
    var builder = new systemjsBuilder(locations.getRootDir(), locations.getSystemJSConfig());

    var fdi;

    var browserDir = locations.getSrcBrowserDir();
    var browserMain = locations.getSrcBrowserMain();

    var relativeBrowserMain = path.relative(browserDir, browserMain);

    var systemDir = locations.getBuildSystemJSDir();
    var buildDir = locations.getBuildBrowserDir();

    return builder
      .build(path.resolve(systemDir, relativeBrowserMain), path.resolve(buildDir, relativeBrowserMain));

  });
};
