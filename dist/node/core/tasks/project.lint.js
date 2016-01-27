var gulp_tslint_1 = require("gulp-tslint");
var tslint_1 = require('../config/tslint');
function registerTask(gulp, locations, userOptions) {
    gulp.task('project.lint', function () {
        gulp.src(locations.getSrcDir() + '/**/*.ts', { base: locations.getSrcDir() })
            .pipe(gulp_tslint_1.default({
            configuration: tslint_1.default
        }))
            .pipe(gulp_tslint_1.default.report("verbose"));
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
