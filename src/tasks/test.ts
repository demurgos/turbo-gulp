import * as testNode from "./test.node";
import Locations from "../config/locations";

export const taskName = "test";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  testNode.registerTask(gulp, locations, options || {});
  gulp.task(taskName, [testNode.taskName]);
}

export default registerTask;
