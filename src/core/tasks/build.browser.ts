module.exports = function (gulp, locations, options) {

  require('./build.browser.systemjs.ts')(gulp, locations, options);

  gulp.task('build.browser', ['build.browser.systemjs']);

};
