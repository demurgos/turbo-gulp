import * as path from "path";

import * as _ from "lodash";
import * as tsc from "gulp-typescript";
import * as merge from "merge2";

import defaultTscConfig from "../config/tsc";
import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations, options?: any) {
  let tscConfig = _.merge({}, defaultTscConfig, options.tsc);

  gulp.task("build.node-test.tsc", function () {
    let tsResult = gulp
      .src(locations.getTypescriptSources("node", false), {
          base: path.join(locations.config.project.root, locations.config.project.sources)
      })
      .pipe(tsc(tscConfig));

    return merge([
      // tsResult.dts.pipe(gulp.dest(locs.definitions)),
      tsResult.js.pipe(gulp.dest(locations.getCoverageDirectory("node")))
    ]);
  });
};
