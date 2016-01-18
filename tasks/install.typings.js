var typings = require('typings');

module.exports = function (gulp, locations) {
  gulp.task('install.typings', function () {
    return typings.install({cwd: locations.getRootDir()});
  });
};
