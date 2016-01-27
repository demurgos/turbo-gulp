var typings_1 = require('typings');
function registerTask(gulp, locations) {
    gulp.task('install.typings', function () {
        return typings_1.default.install({ production: false, cwd: locations.getRootDir() });
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
