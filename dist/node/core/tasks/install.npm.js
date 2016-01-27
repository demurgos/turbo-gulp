var install = require("gulp-install");
function registerTask(gulp, locations) {
    gulp.task('install.npm', function () {
        return gulp.src([locations.getPackage()])
            .pipe(install());
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
