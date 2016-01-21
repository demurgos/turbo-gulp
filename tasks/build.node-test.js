module.exports = function (gulp, locations, options) {
  require('./build.node-test.tsc')(gulp, locations, options || {});
  gulp.task('build.node-test', ['build.node-test.tsc']);
};
