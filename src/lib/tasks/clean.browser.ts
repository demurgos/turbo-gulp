import del = require("del");
import Locations from "../config/config";

export const taskName = "clean:browser";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  gulp.task(taskName, function() {
    return del([locations.getBuildDirectory("browser"), locations.getBuildDirectory("systemjs")]);
  });
}

export default registerTask;
