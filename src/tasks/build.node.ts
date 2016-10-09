import * as buildNodeTsc from "./build.node.tsc";
import Locations from "../config/locations";

export const taskName = "build:node";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  buildNodeTsc.registerTask(gulp, locations, options || {});

  gulp.task(taskName, [buildNodeTsc.taskName]);
}

export default registerTask;
