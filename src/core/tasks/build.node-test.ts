module.exports = function (gulp, locations, options) {
  require('./build.node-test.tsc.ts')(gulp, locations, options || {});
  gulp.task('build.node-test', ['build.node-test.tsc']);
};
