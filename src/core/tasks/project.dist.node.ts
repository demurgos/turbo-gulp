export default function registerTask (gulp, locations, userOptions) {
  gulp.task('project.dist.node', ['build.node'], function(){
    return gulp
      .src([locations.getBuildNodeDir()+'/**/*'], {base: locations.getBuildNodeDir()})
      .pipe(gulp.dest(locations.getDistNodeDir()))
  });
};
