var mocha = require('gulp-mocha');

module.exports = function (gulp, locations, options) {
  gulp.task('test.node', ['build.node'], function(){
    return gulp
      .src([locations.getBuildNodeDir()+'/**/*.spec.js'], { base: locations.getBuildNodeDir()})
      .pipe(mocha({
        reporter: 'spec'
      }));
  });
};
