import buildNodeTsc from './build.node.tsc';

export default function registerTask (gulp, locations, options) {
  buildNodeTsc(gulp, locations, options || {});
  gulp.task('build.node', ['build.node.tsc']);
};
