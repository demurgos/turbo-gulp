var jspm = require('jspm');

module.exports = function (gulp, locations) {
  gulp.task('install.jspm', function () {
    jspm.setPackagePath(locations.getRootDir());
    return jspm.install(true);
  });
};
