var _ = require('lodash');
var tsc = require('gulp-typescript');
var merge = require('merge2');
var tsc_1 = require('../config/tsc');
function registerTask(gulp, locations, options) {
    var tsSources = [];
    tsSources = locations.getTypescriptSources('browser', true);
    var tscConfig = _.assign({}, tsc_1.default, options.tsc);
    tscConfig.module = 'system';
    tscConfig.moduleResolution = 'node';
    gulp.task('build.browser.tsc', function () {
        var tsResult = gulp
            .src(tsSources, { base: locations.config.targets.browser.base })
            .pipe(tsc(tscConfig));
        return merge([
            // tsResult.dts.pipe(gulp.dest(locs.definitions)),
            tsResult.js.pipe(gulp.dest(locations.getBuildSystemJSDir()))
        ]);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
