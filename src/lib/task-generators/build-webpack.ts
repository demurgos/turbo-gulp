/**
 * This module defines the tasks to create webpack bundles.
 *
 * @module task-generators/build-webpack
 */

/** (Placeholder comment, see christopherthielen/typedoc-plugin-external-module-name#6) */

import fancyLog from "fancy-log";
import { FSWatcher } from "fs";
import { Gulp } from "gulp";
import { Minimatch } from "minimatch";
import { posix as path, resolve as sysResolvePath } from "path";
import PluginError from "plugin-error";
import webpack from "webpack";
import webpackMerge from "webpack-merge";
import webpackStream from "webpack-stream";
import { TaskFunction } from "../utils/gulp-task-function";
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
    webpack?: typeof webpack;

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
  let curWebpack: typeof webpack = webpack;
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
    context: sysResolvePath(options.projectRoot),
    target: "web",
    resolve: {
      extensions: [".js", ".json"],
    },
    module: {
      loaders: [
        {
          test: /\.component\.js$/,
          loaders: ["angular2-template-loader"],
          include: [sysResolvePath(options.srcDir)],
        },
        {
          test: /\.json$/,
          loaders: ["json-loader"],
        },
        {
          test: /\.(html|css)$/,
          loaders: ["raw-loader"],
        },
      ],
    },
    plugins: [
      new curWebpack.ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in posix and Windows
        /angular(\\|\/)core(\\|\/)src(\\|\/)linker/,
        sysResolvePath(options.srcDir),
        {},
      ),
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
      Buffer: true,
    },
    devtool: "inline-source-map",
    output: {
      filename: "[name].js",
    },
  };

  const task: TaskFunction = function () {
    return gulp
      .src([path.join(options.srcDir, entryFile)], {base: options.srcDir})
      .pipe(webpackStream(
        // TODO: Remove `as any` once webpackMerge's typing support the latest version of Webpack (with `EntryFunc`)
        webpackMerge(angularWebpackConfig as any, userConfiguration as any),
        // TODO: Remove `as any` once gulpWebpack's typing support the latest version of Webpack (with `EntryFunc`)
        curWebpack as any,
        (err: Error, stats: webpack.Stats): void => {
          // TODO: Check if err is `null` or `undefined` (success) and type properly
          if (<any> err) {
            throw new PluginError("_build:webpack", err);
          }
          fancyLog("[_build:webpack]", stats.toString({colors: true}));
        }),
      )
      .pipe(gulp.dest(options.buildDir));
  };
  task.displayName = "_build:webpack";
  return task;
}

export function watch(gulp: Gulp, options: Options): FSWatcher {
  const buildTask: TaskFunction = generateTask(gulp, options);
  const sources: string = matcher.asString(matcher.join(options.srcDir, new Minimatch("**/*")));
  return gulp.watch(sources, {cwd: options.srcDir}, buildTask) as FSWatcher;
}
