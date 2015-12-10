var _ = require('lodash');
var tsc = require('gulp-typescript');
var merge = require('merge2');

var getLocations = require('../locations');

var defaultOptions = {
  declaration: true,
  noExternalResolve: false,
  noImplicitAny: true,
  module: 'commonjs',
  moduleResolution: 'classic',
  typescript: null, // must be defined in options
  target: 'ES5', // switch to ES6 ?
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  removeComments: false
};


module.exports = function (gulp, options) {
  var locs = getLocations(options);

  var tsSources = []; // [locs.tsdTypings+'/**/*.d.ts', locs.personnalTypings+'/**/*.d.ts'];

  if(options && options.locations && options.locations.nodeSrc){
    tsSources = tsSources.concat(options.locations.nodeSrc);
  }else{
    tsSources.push(locs.src+'/**/*.ts');
  }

  var tsOptions = _.assign({}, defaultOptions, {
    typescript: options.typescript
  });

  gulp.task('build.node.ts', function () {
    var tsResult = gulp
      .src(tsSources, {base: locs.src})
      .pipe(tsc(tsOptions));

    return merge([
      tsResult.dts.pipe(gulp.dest(locs.definitions)),
      tsResult.js.pipe(gulp.dest(locs.release))
    ]);
  });

};
