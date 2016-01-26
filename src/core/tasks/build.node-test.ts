import buildNodeTestTsc from './build.node-test.tsc';

export default function registerTask (gulp, locations, options) {
  buildNodeTestTsc(gulp, locations, options || {});
  gulp.task('build.node-test', ['build.node-test.tsc']);
};
