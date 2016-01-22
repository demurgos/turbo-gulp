var defaultTslintConfig = require('../config/tslint');
var tslint = require('gulp-tslint');

module.exports = function (gulp, locations, userOptions) {
  gulp.task('project.lint.ts', function(){
    gulp.src(locations.getSrcDir() + '/**/*.ts', {base: locations.getSrcDir()})
      .pipe(tslint({
        configuration: defaultTslintConfig
      }))
      .pipe(tslint.report("verbose"));
  });
};
