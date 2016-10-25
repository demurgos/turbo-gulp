import * as typings from "typings-core";
import Locations from "../config/config";

export const taskName = "install:typings";

export function registerTask (gulp: any, locations: Locations, userOptions?: any) {
  gulp.task(taskName, function () {
    const options: typings.InstallOptions = {
      production: false,
      cwd: locations.config.project.root
    };
    return typings.install(options);
  });
}

export default registerTask;
