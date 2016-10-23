import del = require("del");
import Locations from "../config/locations";

export const taskName = "clean:electron";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  gulp.task(taskName, function() {
    return del([locations.getBuildDirectory("electron")]);
  });
}

export default registerTask;
