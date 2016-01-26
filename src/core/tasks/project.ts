module.exports = function (gulp, locations, userOptions) {

  require('./project.lint.ts')(gulp, locations, userOptions);
  require('./project.bump.ts')(gulp, locations, userOptions);
  require('./project.dist.node.ts')(gulp, locations, userOptions);

  gulp.task('project', ['project.lint']);

};
