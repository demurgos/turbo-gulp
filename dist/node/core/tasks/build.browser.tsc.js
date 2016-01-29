var path = require("path");
var _ = require("lodash");
var tsc = require("gulp-typescript");
var merge = require("merge2");
var tsc_1 = require("../config/tsc");
function registerTask(gulp, locations, options) {
    var tscConfig = _.assign({ module: "system", moduleResolution: "node" }, tsc_1.default, options.tsc);
    gulp.task("build.browser.tsc", function () {
        var tsResult = gulp
            .src(locations.getTypescriptSources("browser", false), {
            base: path.join(locations.config.project.root, locations.config.project.sources)
        })
            .pipe(tsc(tscConfig));
        return merge([
            // tsResult.dts.pipe(gulp.dest(locs.definitions)),
            tsResult.js.pipe(gulp.dest(locations.getBuildDirectory("systemjs")))
        ]);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
