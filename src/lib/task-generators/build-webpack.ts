import {FSWatcher} from "fs";
import {Gulp, TaskFunction} from "gulp";
import {log as gulpLog, PluginError} from "gulp-util";
import {Minimatch} from "minimatch";
import {posix as path} from "path";
import webpack = require("webpack");
import webpackMerge = require("webpack-merge");
import webpackStream = require("webpack-stream");
import * as matcher from "../utils/matcher";

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

  webpackOptions?: {
    /**
     * Webpack object to use
     */
    webpack?: webpack.Webpack;

    /**
     * Customize the default webpack configuration
     */
    configuration?: webpack.Configuration;
  };
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

export function generateTask(gulp: Gulp, options: Options): TaskFunction {
  const entryFile: string = options.entry + ".js";
  let curWebpack: webpack.Webpack = webpack;
  let userConfiguration: webpack.Configuration = {};
  if (options.webpackOptions !== undefined) {
    if (options.webpackOptions.webpack !== undefined) {
      curWebpack = options.webpackOptions.webpack;
    }
    if (options.webpackOptions.configuration !== undefined) {
      userConfiguration = options.webpackOptions.configuration;
    }
  }

  const angularWebpackConfig: webpack.Configuration = {
    context: options.projectRoot,
    target: "web",
    resolve: {
      extensions: [".js", ".json"]
    },
    module: {
      loaders: [
        {
          test: /\.component\.js$/,
          loaders: ["angular2-template-loader"],
          include: [options.srcDir]
        },
        {
          test: /\.json$/,
          loaders: ["json-loader"]
        },
        {
          test: /\.(html|css)$/,
          loaders: ["raw-loader"]
        }
      ]
    },
    plugins: [
      new curWebpack.ContextReplacementPlugin(
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
    devtool: "inline-source-map",
    output: {
      filename: "[name].js"
    }
  };

  const task: TaskFunction = function () {
    return gulp
      .src([path.join(options.srcDir, entryFile)], {base: options.srcDir})
      .pipe(webpackStream(
        webpackMerge(angularWebpackConfig, userConfiguration),
        curWebpack,
        (err: Error, stats: webpack.compiler.Stats): void => {
          if (err) {
            throw new PluginError("_build:webpack", err);
          }
          gulpLog(`[_build:webpack]`, stats.toString({colors: true}));
        })
      )
      .pipe(gulp.dest(options.buildDir));
  };
  task.displayName = "_build:webpack";
  return task;
}

export function watch(gulp: Gulp, options: Options): FSWatcher {
  const buildTask: TaskFunction = generateTask(gulp, options);
  const sources: string = matcher.asString(matcher.join(options.srcDir, new Minimatch("**/*")));
  return gulp.watch(sources, {cwd: options.srcDir}, buildTask);
}

export default generateTask;
