var jspm = require('jspm');
function registerTask(gulp, locations) {
    gulp.task('install.jspm', function () {
        jspm.setPackagePath(locations.config.project.root);
        return jspm.install(true);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
