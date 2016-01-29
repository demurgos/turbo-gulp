// TODO: move to custom definitions
import Locations from "../config/locations";
declare module "gulp-typescript"{
  interface StaticGulpTypescript{
    (tsConfig: any): any;
  }
  let staticGulpTypescript: StaticGulpTypescript;
  export = staticGulpTypescript;
}

// TODO: move to custom definitions
declare module "merge2"{
  interface StaticMerge2{
    (streams: any[]): any;
  }
  let staticMerge2: StaticMerge2;
  export = staticMerge2;
}

import * as _ from 'lodash';

import buildNode from './build.node';
import buildNodeTest from './build.node-test';
import buildBrowser from './build.browser';

var defaultBuilds = {
  node: true,
  browser: true
};

export default function registerTask (gulp:any, locations: Locations, userOptions?:any) {

  var buildOptions = _.assign({}, defaultBuilds, userOptions);
  var buildTasks = [];

  if(buildOptions.node){
    buildTasks.push('build.node');
    buildNode(gulp, locations, userOptions);

    buildTasks.push('build.node-test');
    buildNodeTest(gulp, locations, userOptions);
  }

  if(buildOptions.browser){
    buildTasks.push('build.browser');
    buildBrowser(gulp, locations, userOptions);
  }

  gulp.task('build', buildTasks);

};
