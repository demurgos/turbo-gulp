var path = require('path');
function registerTask(gulp, locations, userOptions) {
    gulp.task('project.dist.node', ['build.node'], function () {
        return gulp
            .src([path.join(locations.getBuildDirectory('node'), '**/*')], { base: locations.getBuildDirectory('node') })
            .pipe(gulp.dest(locations.getDistDirectory('node')));
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
