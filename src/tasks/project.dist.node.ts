import * as path from "path";
import * as buildNode from "./build.node";
import Locations from "../config/locations";

export const taskName = "project:dist:node";

export function registerTask (gulp: any, locations: Locations, userOptions?: any) {
  buildNode.registerTask(gulp, locations, userOptions || {});

  gulp.task(taskName, [buildNode.taskName], function(){
    return gulp
      .src([path.join(locations.getBuildDirectory("node"), "**/*")], {base: locations.getBuildDirectory("node")})
      .pipe(gulp.dest(locations.getDistDirectory("node")));
  });
}

export default registerTask;
