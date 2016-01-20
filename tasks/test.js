module.exports = function (gulp, locations, options) {
  require('./test.node')(gulp, locations, options || {});
  gulp.task('test', ['test.node']);
};
