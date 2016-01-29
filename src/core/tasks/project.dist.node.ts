import * as path from 'path';
import Locations from "../config/locations";

export default function registerTask (gulp:any, locations: Locations, userOptions?: any) {
  gulp.task('project.dist.node', ['build.node'], function(){
    return gulp
      .src([path.join(locations.getBuildDirectory('node'), '**/*')], {base: locations.getBuildDirectory('node')})
      .pipe(gulp.dest(locations.getDistDirectory('node')))
  });
};
