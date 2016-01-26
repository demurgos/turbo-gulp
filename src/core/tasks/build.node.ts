module.exports = function (gulp, locations, options) {
  require('./build.node.tsc.ts')(gulp, locations, options || {});
  gulp.task('build.node', ['build.node.tsc']);
};
