var install = require("gulp-install");

module.exports = function (gulp, locations) {
  gulp.task('install.npm', function () {
    return gulp.src([locations.getPackage()])
      .pipe(install());
  });
};
