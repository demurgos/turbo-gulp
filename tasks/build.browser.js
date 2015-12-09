var path = require('path');

var _ = require('lodash');
var tsc = require('gulp-typescript');
var browserify = require('browserify');
var browserifyShim = require('browserify-shim');
var vinylBuffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var concat = require('gulp-concat-sourcemap');
var wiredep = require('wiredep');

var getLocations = require('../locations');

var defaultOptions = {
  declaration: false,
  noExternalResolve: false,
  noImplicitAny: true,
  module: 'commonjs',
  moduleResolution: 'classic',
  typescript: null, // must be defined in options
  target: 'ES5',
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  removeComments: false
};


module.exports = function (gulp, options) {
  var locs = getLocations(options);

  var tsOptions = _.assign({}, defaultOptions, {
    typescript: options.typescript
  });

  var tsSources = [locs.tsdTypings+'/**/*.d.ts', locs.personnalTypings+'/**/*.d.ts'];

  if(options && options.locations && options.locations.nodeSrc){
    tsSources = tsSources.concat(options.locations.nodeSrc);
  }else{
    tsSources.push(locs.src+'/**/*.ts');
  }
  
  var name = options && options.name ? options.name : 'main';

  // compile typescript
  gulp.task('build.browser._ts', function () {
    var tsResult =  gulp
      .src(tsSources, {base: locs.src})
      .pipe(tsc(tsOptions))
      // .pipe(relativeRequire({}))
      .pipe(gulp.dest(locs.browserTmp));

    return tsResult;
  });

  // browserify
  gulp.task('build.browser.ts', ['build.browser._ts'], function () {
    var entry = path.join(locs.browserTmp, path.relative(locs.src, locs.browserMain) + '.js');
    var b = browserify({
      entries: entry,
      basedir: locs.browserTmp,
      debug: true,
      transform: [browserifyShim],
      standalone: '_Error'
    });

    return b
      // .require(entry, { expose: 'default'})
      .bundle()
      .pipe(plumber())
      .pipe(source(name+'.core.js'))
      .pipe(vinylBuffer())
      .on('error', gutil.log)
      .pipe(gulp.dest(locs.browser));
  });

  // bundle
  gulp.task('build.browser.bundle', ['build.browser.ts'], function (done) {
    var bowerFiles = wiredep();
    var sources = [];
    if(bowerFiles.js){
      for(var i= 0, l=bowerFiles.js.length; i<l; i++){
        sources.push(bowerFiles.js[i]);
      }
    }
    sources.push(locs.browser+'/'+name+'.core.js');
    return gulp.src(sources)
      .pipe(concat(name+'.js'))
      .pipe(gulp.dest(locs.browser));
  });
  
};
