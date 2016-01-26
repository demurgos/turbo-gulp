import tslint from "gulp-tslint";

import defaultTslintConfig from '../config/tslint';

export default function registerTask (gulp, locations, userOptions) {
  gulp.task('project.lint', function(){
    gulp.src(locations.getSrcDir() + '/**/*.ts', {base: locations.getSrcDir()})
      .pipe(tslint({
        configuration: defaultTslintConfig
      }))
      .pipe(tslint.report("verbose"));
  });
};

