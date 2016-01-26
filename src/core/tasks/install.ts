import * as _ from 'lodash';

import installJspm from './install.jspm';
import installNpm from './install.npm';
import installTypings from './install.typings';

var defaultInstall = {
  jspm: true,
  npm: true,
  typings: true
};

export default function registerTask (gulp, locations, userOptions) {

  var installOptions = _.assign({}, defaultInstall, userOptions);
  var installTasks = [];

  if(installOptions.jspm){
    installTasks.push('install.jspm');
    installJspm(gulp, locations);
  }

  if(installOptions.npm){
    installTasks.push('install.npm');
    installNpm(gulp, locations);
  }

  if(installOptions.typings){
    installTasks.push('install.typings');
    installTypings(gulp, locations);
  }

  gulp.task('install', installTasks);
  gulp.task('install.noNpm', _.without(installTasks, 'install.npm'));

};
