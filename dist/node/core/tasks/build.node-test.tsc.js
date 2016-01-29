var path = require("path");
var _ = require("lodash");
var tsc = require("gulp-typescript");
var merge = require("merge2");
var tsc_1 = require("../config/tsc");
function registerTask(gulp, locations, options) {
    var tscConfig = _.merge({}, tsc_1.default, options.tsc);
    gulp.task("build.node-test.tsc", function () {
        var tsResult = gulp
            .src(locations.getTypescriptSources("node", false), {
            base: path.join(locations.config.project.root, locations.config.project.sources)
        })
            .pipe(tsc(tscConfig));
        return merge([
            // tsResult.dts.pipe(gulp.dest(locs.definitions)),
            tsResult.js.pipe(gulp.dest(locations.getCoverageDirectory("node")))
        ]);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
