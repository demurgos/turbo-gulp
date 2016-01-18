module.exports = function (gulp, locations, options) {
  require('./build.node.stc')(gulp, locations, options || {});
  gulp.task('build.node', ['build.node.tsc']);
};
