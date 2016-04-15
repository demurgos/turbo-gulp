import buildNodeTestTsc from "./build.node-test.tsc";
import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations, options?: any) {
  buildNodeTestTsc(gulp, locations, options || {});
  gulp.task("build.node-test", ["build.node-test.tsc"]);
};
