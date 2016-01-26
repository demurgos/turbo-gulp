import * as mocha from 'mocha';

export default function registerTask (gulp, locations, options) {
  gulp.task('test.node', ['build.node-test'], function(){
    return gulp
      .src([locations.getBuildNodeTestDir()+'/**/*.spec.js'], { base: locations.getBuildNodeTestDir()})
      .pipe(mocha({
        reporter: 'spec'
      }));
  });
};
