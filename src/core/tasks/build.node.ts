import buildNodeTsc from './build.node.tsc';
import Locations from "../config/locations";

export default function registerTask (gulp:any, locations: Locations, options?: any) {
  buildNodeTsc(gulp, locations, options || {});
  gulp.task('build.node', ['build.node.tsc']);
};
