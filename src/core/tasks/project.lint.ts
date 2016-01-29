import * as path from 'path';

import * as tslint from "gulp-tslint";

import defaultTslintConfig from '../config/tslint';
import Locations from "../config/locations";

export default function registerTask (gulp:any, locations: Locations, userOptions?: any) {
  gulp.task('project.lint', function(){
    let sourcesDir = path.join(locations.config.project.root, locations.config.project.sources);
    gulp.src(path.join(sourcesDir, '**/*.ts'), {base: sourcesDir})
      .pipe(tslint({
        configuration: defaultTslintConfig
      }))
      .pipe(tslint.report("verbose"));
  });
};
