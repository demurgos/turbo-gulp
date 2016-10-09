import * as buildBrowserSystemjs from "./build.browser.systemjs";
import Locations from "../config/locations";

export const taskName = "build:browser";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  buildBrowserSystemjs.registerTask(gulp, locations, options|| {});

  gulp.task(taskName, [buildBrowserSystemjs.taskName]);
}

export default registerTask;
