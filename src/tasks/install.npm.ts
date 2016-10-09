import * as install from "gulp-install";

import Locations from "../config/locations";

export const taskName = "install:npm";

export function registerTask (gulp: any, locations: Locations, userOptions?: any) {
  gulp.task(taskName, function () {
    return gulp.src([locations.config.project.package])
      .pipe(install());
  });
}

export default registerTask;
