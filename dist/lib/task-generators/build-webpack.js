// import webpack = require("webpack");
// import webpackStream = require("webpack-stream");
"use strict";
function registerTask(gulp, targetName, options) {
    // const task = function (callback) {
    //   // modify some webpack config options
    //   var myConfig = Object.create(webpackConfig);
    //   myConfig.plugins = myConfig.plugins.concat(
    //     new webpack.DefinePlugin({
    //       "process.env": {
    //         // This has effect on the react lib size
    //         "NODE_ENV": JSON.stringify("production")
    //       }
    //     }),
    //     new webpack.optimize.DedupePlugin(),
    //     new webpack.optimize.UglifyJsPlugin()
    //   );
    //
    //   // run webpack
    //   webpack(myConfig, function(err, stats) {
    //     if(err) throw new gutil.PluginError("webpack:build", err);
    //     gutil.log("[webpack:build]", stats.toString({
    //       colors: true
    //     }));
    //     callback();
    //   });
    // };
    //
    //
    //
    // gulp.task(`build:${targetName}:webpack`, task);
    //
    // return task;
}
exports.registerTask = registerTask;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerTask;
