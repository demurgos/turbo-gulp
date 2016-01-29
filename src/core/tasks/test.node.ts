import * as path from 'path';

import * as mocha from 'gulp-mocha';
import Locations from "../config/locations";

export default function registerTask (gulp:any, locations: Locations, options?: any) {
  gulp.task('test.node', ['build.node-test'], function(){
    return gulp
      .src([path.join(locations.getBuildDirectory('node'), '**/*.spec.js')], { base: locations.getBuildDirectory('node')})
      .pipe(mocha({
        reporter: 'spec'
      }));
  });
};
