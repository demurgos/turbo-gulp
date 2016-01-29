import * as path from 'path';

import * as _ from 'lodash';
import * as Builder from 'systemjs-builder';

import buildBrowserTsc from './build.browser.tsc';
import Locations from "../config/locations";

// TODO: move to custom definitions
declare module "systemjs-builder"{
  class Builder{
    constructor(projectRoot: string, systemjsConfigPath: string);
    build(entryPointPath: string, ouputFile: string): any;
  }
  export = Builder;
}

export default function registerTask (gulp:any, locations: Locations, options?: any) {

  buildBrowserTsc(gulp, locations, options);

  gulp.task('build.browser.systemjs', ['build.browser.tsc'], function () {
    var builder = new Builder(locations.config.project.root, locations.config.project.systemjsConfig);

    var fdi;

    /*var browserDir = locations.getSrcBrowserDir();
    var browserMain = locations.getSrcBrowserMain();*/

    var relativeBrowserMain = 'browser/main'; // path.relative(browserDir, browserMain);

    var systemDir = locations.getBuildDirectory('systemjs');
    var buildDir = locations.getBuildDirectory('browser');

    return builder
      .build(path.resolve(systemDir, relativeBrowserMain), path.resolve(buildDir, relativeBrowserMain));

  });
};
