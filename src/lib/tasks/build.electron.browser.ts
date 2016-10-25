import * as path from "path";

import * as buildBrowser from "./build.browser"
import Locations from "../config/config";

export const taskName = "build:electron:browser";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  buildBrowser.registerTask(gulp, locations, options|| {});

  gulp.task(taskName, [buildBrowser.taskName], function(){
    const browserInput = locations.getBuildDirectory("browser");
    const browserOutput = path.resolve(locations.getBuildDirectory("electron"), "browser");
    return gulp.src([path.resolve(browserInput, "**/*")], {base: browserInput})
      .pipe(gulp.dest(browserOutput));
  });
}

export default registerTask;
