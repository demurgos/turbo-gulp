import * as typings from "typings-core";
import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations, userOptions?: any) {
  gulp.task("install.typings", function () {
    const options: typings.InstallOptions = {
      production: false,
      cwd: locations.config.project.root
    };
    return typings.install(options);
  });
};
