import * as buildNodeTestTsc from "./build.node-test.tsc";
import Locations from "../config/locations";

export const taskName = "build:node-test";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  buildNodeTestTsc.registerTask(gulp, locations, options || {});

  gulp.task(taskName, [buildNodeTestTsc.taskName]);
}

export default registerTask;
