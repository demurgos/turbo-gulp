import buildBrowserSystemjs from './build.browser.systemjs';

export default function registerTask (gulp, locations, options) {
  buildBrowserSystemjs(gulp, locations, options);
  gulp.task('build.browser', ['build.browser.systemjs']);
};
