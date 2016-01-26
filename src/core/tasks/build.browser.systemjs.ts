import * as path from 'path';

import * as _ from 'lodash';
import * as Builder from 'systemjs-builder';

import buildBrowserTsc from './build.browser.tsc';

// TODO: move to custom definitions
declare module "systemjs-builder"{
  class Builder{
    constructor(projectRoot: string, systemjsConfigPath: string);
    build(entryPointPath: string, ouputFile: string): any;
  }
  export = Builder;
}

export default function registerTask (gulp, locations, options) {

  buildBrowserTsc(gulp, locations, options);

  gulp.task('build.browser.systemjs', ['build.browser.tsc'], function () {
    var builder = new Builder(locations.getRootDir(), locations.getSystemJSConfig());

    var fdi;

    var browserDir = locations.getSrcBrowserDir();
    var browserMain = locations.getSrcBrowserMain();

    var relativeBrowserMain = path.relative(browserDir, browserMain);

    var systemDir = locations.getBuildSystemJSDir();
    var buildDir = locations.getBuildBrowserDir();

    return builder
      .build(path.resolve(systemDir, relativeBrowserMain), path.resolve(buildDir, relativeBrowserMain));

  });
};
