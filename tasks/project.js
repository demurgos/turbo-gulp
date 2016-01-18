module.exports = function (gulp, locations, userOptions) {

  require('./project.lint')(gulp, locations, userOptions);
  require('./project.bump')(gulp, locations, userOptions);

  gulp.task('project', ['project.lint']);

};
