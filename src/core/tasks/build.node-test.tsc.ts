import * as _ from 'lodash';
import * as tsc from 'gulp-typescript';
import * as merge from 'merge2';

import defaultTscConfig from '../config/tsc';

export default function registerTask (gulp, locations, options) {
  var tscConfig = _.assign({}, defaultTscConfig, options.tsc);

  gulp.task('build.node-test.tsc', function () {
    var tsResult = gulp
      .src(locations.getTypescriptSources('node'), {base: locations.config.targets.node.base})
      .pipe(tsc(tscConfig));

    return merge([
      // tsResult.dts.pipe(gulp.dest(locs.definitions)),
      tsResult.js.pipe(gulp.dest(locations.getBuildNodeTestDir()))
    ]);
  });
};
