var mocha = require('gulp-mocha');

module.exports = function (gulp, locations, options) {
  gulp.task('test.node', ['build.node-test'], function(){
    return gulp
      .src([locations.getBuildNodeTestDir()+'/**/*.spec.js'], { base: locations.getBuildNodeTestDir()})
      .pipe(mocha({
        reporter: 'spec'
      }));
  });
};
