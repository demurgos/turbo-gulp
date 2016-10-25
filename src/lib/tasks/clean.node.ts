import del = require("del");
import Locations from "../config/config";

export const taskName = "clean:node";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  gulp.task(taskName, function() {
    return del([locations.getBuildDirectory("node")]);
  });
}

export default registerTask;
