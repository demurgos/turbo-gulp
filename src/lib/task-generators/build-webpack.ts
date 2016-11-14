import {Webpack, Configuration as WebpackConfiguration, compiler as webpackCompiler} from "webpack";
import webpackStream = require("webpack-stream");
import webpackMerge = require("webpack-merge");
import {join as joinPath} from "path";
import {PluginError, log as gulpLog} from "gulp-util";
import {Gulp} from "gulp";

export interface Options {
  /**
   * Root of the main project (with package.json)
   */
  projectRoot: string;

  /**
   * Directory containing the JS sources.
   */
  srcDir: string;

  /**
   * Directory were the result will be piped
   */
  buildDir: string;

  /**
   * Entry module, relative to `jsSrcDir`
   */
  entry: string;

  /**
   * Webpack object to use
   */
  webpack: Webpack;

  /**
   * Customize the default webpack configuration
   */
  webpackConfig: WebpackConfiguration;
}

export function getTaskName(targetName: string): string {
  return `build:${targetName}:webpack`;
}

export function generateTask(gulp: Gulp, targetName: string, options: Options): Function {
  const taskName: string = getTaskName(targetName);
  const entryFile = options.entry + ".js";

  const angularWebpackConfig: WebpackConfiguration = {
    context: options.projectRoot,
    target: "web",
    resolve: {
      extensions: [".js", ".json"]
    },
    module: {
      loaders: [
        {test: /\.ts$/, loaders: ["angular2-template-loader"]},
        {test: /\.json$/, loader: "json-loader"}
      ]
    },
    plugins: [
      new options.webpack.ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in posix and Windows
        /angular(\\|\/)core(\\|\/)src(\\|\/)linker/,
        options.srcDir,
        {}
      )
      // new webpack.DefinePlugin({
      //   "process.env": {
      //     "NODE_ENV": JSON.stringify("production")
      //   }
      // }),
      // new webpack.optimize.DedupePlugin(),
      // new webpack.optimize.UglifyJsPlugin()
    ],
    node: {
      global: true,
      __dirname: true,
      __filename: true,
      process: true,
      Buffer: true
    },
    output: {
      filename: "[name].js",
    },
  };

  const task = function () {
    return gulp
      .src([joinPath(options.srcDir, entryFile)], {base: options.srcDir})
      .pipe(webpackStream(
        webpackMerge(angularWebpackConfig, options.webpackConfig),
        options.webpack,
        (err: Error, stats: webpackCompiler.Stats): void => {
          if (err) {
            throw new PluginError(taskName, err);
          }
          gulpLog(`[${taskName}]`, stats.toString({colors: true}));
        })
      )
      .pipe(gulp.dest(options.buildDir));
  };

  return task;
}

export function registerTask(gulp: Gulp, targetName: string, options: Options): Function {
  const taskName: string = getTaskName(targetName);
  const task = generateTask(gulp, taskName, options);
  gulp.task(taskName, task);
  return task;
}

export default registerTask;
