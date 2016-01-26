module.exports = function (gulp, locations, userOptions) {

  require('./project.lint.ts.ts')(gulp, locations, userOptions);
  gulp.task('project.lint', ['project.lint.ts']);

};
