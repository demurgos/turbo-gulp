import {Gulp, TaskFunction} from "gulp";
import {log as gulpLog, PluginError} from "gulp-util";
import {join as joinPath} from "path";
import {compiler as webpackCompiler, Configuration as WebpackConfiguration, Webpack} from "webpack";
import webpackMerge = require("webpack-merge");
import webpackStream = require("webpack-stream");

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

/**
 * Return the canonical name of the build-webpack task according to the target name.
 *
 * @param targetName Current target name
 * @returns {string} The canonical of the build-webpack task for the provided target
 */
export function getTaskName(targetName: string): string {
  return `${targetName}:build:webpack`;
}

export function generateTask(gulp: Gulp, targetName: string, options: Options): TaskFunction {
  const taskName: string = getTaskName(targetName);
  const entryFile: string = options.entry + ".js";

  const angularWebpackConfig: WebpackConfiguration = {
    context: options.projectRoot,
    target: "web",
    resolve: {
      extensions: [".js", ".json"]
    },
    module: {
      loaders: [
        {test: /\.js$/, loaders: ["angular2-template-loader"]},
        {test: /\.json$/, loader: "json-loader"},
        {test: /\.(html|css)$/, loader: "raw-loader"}
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
      filename: "[name].js"
    }
  };

  return function () {
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
}

export function registerTask(gulp: Gulp, targetName: string, options: Options): TaskFunction {
  const taskName: string = getTaskName(targetName);
  const task: TaskFunction = generateTask(gulp, taskName, options);
  gulp.task(taskName, task);
  return task;
}

export default registerTask;
