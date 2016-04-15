import * as path from "path";

import * as _ from "lodash";

import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations, options?: any) {
  gulp.task("build.electron.browser", ["build.browser"], function(){
    let browserInput = locations.getBuildDirectory("browser");
    let browserOutput = path.resolve(locations.getBuildDirectory("electron"), "browser");
    return gulp.src([path.resolve(browserInput, "**/*")], {base: browserInput})
      .pipe(gulp.dest(browserOutput));
  });
};
