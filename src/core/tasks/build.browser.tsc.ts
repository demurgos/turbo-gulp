import * as _ from 'lodash';
import * as tsc from 'gulp-typescript';
import * as merge from 'merge2';

import defaultTscConfig from '../config/tsc';
defaultTscConfig.module = 'system';
defaultTscConfig.moduleResolution = 'node';

export default function registerTask (gulp, locations, options) {
  var tsSources = [];

  tsSources = tsSources.concat(locations.getDefinitionsBrowser());
  tsSources.push(locations.getSrcCoreDir()+'/**/*.ts');
  tsSources.push(locations.getSrcBrowserDir()+'/**/*.ts');
  // tsSources.push('!**/*.spec.ts');
  
  var tscConfig = _.assign({}, defaultTscConfig, options.tsc);

  gulp.task('build.browser.tsc', function () {
    var tsResult = gulp
      .src(tsSources, {base: locations.getSrcDir()})
      .pipe(tsc(tscConfig));

    return merge([
      // tsResult.dts.pipe(gulp.dest(locs.definitions)),
      tsResult.js.pipe(gulp.dest(locations.getBuildSystemJSDir()))
    ]);
  });
};
