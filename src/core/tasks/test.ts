import testNode from './test.node'

export default function registerTask (gulp, locations, options) {
  testNode(gulp, locations, options || {});
  gulp.task('test', ['test.node']);
};
