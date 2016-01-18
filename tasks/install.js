var _ = require('lodash');

var defaultInstall = {
  jspm: true,
  npm: true,
  typings: true
};

module.exports = function (gulp, locations, userOptions) {

  var installOptions = _.assign({}, defaultInstall, userOptions);
  var installTasks = [];

  if(installOptions.jspm){
    installTasks.push('install.jspm');
    require('./install.jspm')(gulp, locations);
  }

  if(installOptions.npm){
    installTasks.push('install.npm');
    require('./install.npm')(gulp, locations);
  }

  if(installOptions.typings){
    installTasks.push('install.typings');
    require('./install.typings')(gulp, locations);
  }

  gulp.task('install', installTasks);
  gulp.task('install.noNpm', _.without(installTasks, 'install.npm'));

};
