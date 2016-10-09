import * as jspm from "jspm";

import Locations from "../config/locations";

export const taskName = "install:jspm";

export function registerTask (gulp: any, locations: Locations, userOptions?: any) {
  gulp.task(taskName, function () {
    jspm.setPackagePath(locations.config.project.root);
    return jspm.install(true);
  });
}

export default registerTask;
