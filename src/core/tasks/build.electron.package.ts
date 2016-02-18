import * as path from "path";

import * as _ from "lodash";

import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations, options?: any) {
  gulp.task('build.electron.package', function(){
    let electronSrc = locations.getSourceDirectory("electron");
    let packageInput = path.resolve(electronSrc, "package.json");
    return gulp.src([packageInput], {base: electronSrc})
      .pipe(gulp.dest(locations.getBuildDirectory("electron")));
  });
};
