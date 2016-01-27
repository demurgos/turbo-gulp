var _ = require('lodash');
var tsc = require('gulp-typescript');
var merge = require('merge2');
var tsc_1 = require('../config/tsc');
function registerTask(gulp, locations, options) {
    var tscConfig = _.assign({}, tsc_1.default, options.tsc);
    gulp.task('build.node.tsc', function () {
        var tsResult = gulp
            .src(locations.getTypescriptSources('node', true), { base: locations.config.targets.node.base })
            .pipe(tsc(tscConfig));
        return merge([
            // tsResult.dts.pipe(gulp.dest(locs.definitions)),
            tsResult.js.pipe(gulp.dest(locations.getBuildDirectory('node')))
        ]);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
