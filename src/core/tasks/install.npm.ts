import * as install from "gulp-install";

import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations) {
  gulp.task("install.npm", function () {
    return gulp.src([locations.config.project.package])
      .pipe(install());
  });
};
