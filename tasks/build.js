var _ = require('lodash');

var defaultBuilds = {
  node: true,
  browser: true
};

module.exports = function (gulp, locations, userOptions) {

  var buildOptions = _.assign({}, defaultBuilds, userOptions);
  var buildTasks = [];

  if(buildOptions.node){
    buildTasks.push('build.node');
    require('./build.node')(gulp, locations, userOptions);
  }

  if(buildOptions.browser){
    buildTasks.push('build.browser');
    require('./build.browser')(gulp, locations, userOptions);
  }

  gulp.task('build', buildTasks);

};
