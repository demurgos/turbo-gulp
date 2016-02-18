import * as path from "path";

import * as _ from "lodash";
import * as tsc from "gulp-typescript";
import * as merge from "merge2";

import defaultTscConfig from "../config/tsc";
import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations, options?: any) {
  let tscConfig = _.assign({}, defaultTscConfig, options.tsc);

  gulp.task("build.electron.tsc", function () {
    let tsResult = gulp
      .src(locations.getTypescriptSources("electron", true), {
        base: path.join(locations.config.project.root, locations.config.project.sources)
      })
      .pipe(tsc(tscConfig));

    return merge([
      // tsResult.dts.pipe(gulp.dest(locs.definitions)),
      tsResult.js.pipe(path.resolve(gulp.dest(locations.getBuildDirectory("electron"), "electron")))
    ]);
  });
};
