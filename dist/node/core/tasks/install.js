var _ = require("lodash");
var install_jspm_1 = require("./install.jspm");
var install_npm_1 = require("./install.npm");
var install_typings_1 = require("./install.typings");
var defaultInstall = {
    jspm: true,
    npm: true,
    typings: true
};
function registerTask(gulp, locations, userOptions) {
    var installOptions = _.merge({}, defaultInstall, userOptions);
    var installTasks = [];
    if (installOptions.jspm) {
        installTasks.push("install.jspm");
        install_jspm_1.default(gulp, locations);
    }
    if (installOptions.npm) {
        installTasks.push("install.npm");
        install_npm_1.default(gulp, locations);
    }
    if (installOptions.typings) {
        installTasks.push("install.typings");
        install_typings_1.default(gulp, locations);
    }
    gulp.task("install", installTasks);
    gulp.task("install.noNpm", _.without(installTasks, "install.npm"));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
;
