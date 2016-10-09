import * as path from "path";

import gulpTslint from "gulp-tslint";
import * as tslint from "tslint";

import defaultTslintConfig from "../config/tslint";
import Locations from "../config/locations";

export const taskName = "project:lint";

export function registerTask (gulp: any, locations: Locations, userOptions?: any) {
  gulp.task(taskName, function(){
    let sourcesDir = path.join(locations.config.project.root, locations.config.project.sources);
    gulp.src(path.join(sourcesDir, "**/*.ts"), {base: sourcesDir})
      .pipe(gulpTslint({
        configuration: defaultTslintConfig,
        formatter: "verbose",
        tslint: tslint
      }))
      .pipe(gulpTslint.report());
  });
}

export default registerTask;
