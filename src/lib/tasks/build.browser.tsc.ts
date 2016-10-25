import * as path from "path";

import * as _ from "lodash";
import * as tsc from "gulp-typescript";
import * as merge from "merge2";

import defaultTscConfig from "../config/tsc";
import Locations from "../config/config";

export const taskName = "build:browser:tsc";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  const tscConfig = _.assign({}, defaultTscConfig, {module: "system", moduleResolution: "node"}, options.tsc);

  gulp.task(taskName, function () {
    const tsResult = gulp
        .src(locations.getTypescriptSources("browser", false), {
          base: path.join(locations.config.project.root, locations.config.project.sources)
        })
      .pipe(tsc(tscConfig));

    return merge([
      // tsResult.dts.pipe(gulp.dest(locs.definitions)),
      tsResult.js.pipe(gulp.dest(locations.getBuildDirectory("systemjs")))
    ]);
  });
}

export default registerTask;
