module.exports = function (gulp, locations, options) {
  require('./test.node.ts')(gulp, locations, options || {});
  gulp.task('test', ['test.node']);
};
