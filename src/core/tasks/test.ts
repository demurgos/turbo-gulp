import testNode from './test.node'
import Locations from "../config/locations";

export default function registerTask (gulp:any, locations: Locations, options?: any) {
  testNode(gulp, locations, options || {});
  gulp.task('test', ['test.node']);
};
