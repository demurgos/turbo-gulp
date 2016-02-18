var path = require("path");
function registerTask(gulp, locations, options) {
    gulp.task('build.electron.browser', ["build.browser"], function () {
        var browserInput = locations.getBuildDirectory("browser");
        var browserOutput = path.resolve(locations.getBuildDirectory("electron"), "browser");
        return gulp.src([path.resolve(browserInput, '**/*')], { base: browserInput })
            .pipe(gulp.dest(browserOutput));
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
