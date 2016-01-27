var mocha = require('mocha');
function registerTask(gulp, locations, options) {
    gulp.task('test.node', ['build.node-test'], function () {
        return gulp
            .src([locations.getBuildNodeTestDir() + '/**/*.spec.js'], { base: locations.getBuildNodeTestDir() })
            .pipe(mocha({
            reporter: 'spec'
        }));
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
