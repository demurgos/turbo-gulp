import * as jspm from "jspm";

import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations) {
  gulp.task("install.jspm", function () {
    jspm.setPackagePath(locations.config.project.root);
    return jspm.install(true);
  });
};
