var _ = require('lodash');

var install = require("gulp-install");
var jspm = require('jspm');

var defaultInstall = {
  npm: true,
  tsd: true,
  bower: true,
  jspm: true
};

module.exports = function (gulp, options) {

  var installOptions = _.assign({}, defaultInstall, options.install);

  var installTasks = [];
  for(var key in defaultInstall){
    if(installOptions[key]){
      installTasks.push('install.'+key);
    }
  }

  gulp.task('install', installTasks);

  gulp.task('install.tsd', function () {
    return gulp.src(['./tsd.json'])
      .pipe(install());
  });

  gulp.task('install.npm', function () {
    return gulp.src(['./package.json'])
      .pipe(install());
  });

  gulp.task('install.bower', function () {
    return gulp.src(['./bower.json'])
      .pipe(install());
  });

  gulp.task('install.jspm', function () {
    jspm.setPackagePath('.');
    return jspm.install(true);
  });

};
