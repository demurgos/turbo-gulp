import buildBrowserTsc from './build.browser.tsc';

export default function registerTask (gulp, locations, options) {
  require('./build.browser.systemjs.ts')(gulp, locations, options);
  gulp.task('build.browser', ['build.browser.systemjs']);
};
