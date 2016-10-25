import * as buildNodeTsc from "../task-generators/build-typescript";
import Locations from "../config/config";

export const taskName = "build:node";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  buildNodeTsc.registerTask(gulp, locations, options || {});

  gulp.task(taskName, [buildNodeTsc.taskName]);
}

export default registerTask;
