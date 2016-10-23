import * as path from "path";

import Locations from "../config/locations";

export const taskName = "build:electron:package";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  gulp.task(taskName, function(){
    const electronSrc = locations.getSourceDirectory("electron");
    const packageInput = path.resolve(electronSrc, "package.json");
    return gulp.src([packageInput], {base: electronSrc})
      .pipe(gulp.dest(locations.getBuildDirectory("electron")));
  });
}

export default registerTask;
