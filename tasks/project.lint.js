module.exports = function (gulp, locations, userOptions) {

  require('./project.lint.ts')(gulp, locations, userOptions);
  gulp.task('project.lint', ['project.lint.ts']);

};
