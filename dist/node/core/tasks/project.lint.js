var path = require("path");
var tslint = require("gulp-tslint");
var tslint_1 = require("../config/tslint");
function registerTask(gulp, locations, userOptions) {
    gulp.task("project.lint", function () {
        var sourcesDir = path.join(locations.config.project.root, locations.config.project.sources);
        gulp.src(path.join(sourcesDir, "**/*.ts"), { base: sourcesDir })
            .pipe(tslint({
            configuration: tslint_1.default
        }))
            .pipe(tslint.report("verbose"));
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
