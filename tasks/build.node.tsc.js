var _ = require('lodash');
var tsc = require('gulp-typescript');
var merge = require('merge2');

var defaultTscConfig = require('../config/tsc');

module.exports = function (gulp, locations, options) {
  var tsSources = [];

  // tsSources.concat(locations.getDefinitionsNode());
  tsSources.push(locations.getSrcCoreDir()+'/**/*.ts');
  tsSources.push(locations.getSrcNodeDir()+'/**/*.ts');

  var tscConfig = _.assign({}, defaultTscConfig, options.tsc);

  gulp.task('build.node.tsc', function () {
    var tsResult = gulp
      .src(tsSources, {base: locations.getSrcDir()})
      .pipe(tsc(tscConfig));

    return merge([
      // tsResult.dts.pipe(gulp.dest(locs.definitions)),
      tsResult.js.pipe(gulp.dest(locations.getBuildNodeDir()))
    ]);
  });
};
