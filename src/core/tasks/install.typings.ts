import typings from 'typings';

export default function registerTask (gulp, locations) {
  gulp.task('install.typings', function () {
    return typings.install({production: false, cwd: locations.getRootDir()});
  });
};
