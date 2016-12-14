import Bluebird = require("bluebird");
import del = require("del");
import {Gulp} from "gulp";
import {posix as path} from "path";

import {ProjectOptions, TestTarget} from "../config/config";
import * as buildTypescript from "../task-generators/build-typescript";
import * as testNode from "../task-generators/test-node";
import * as tsconfigJson from "../task-generators/tsconfig-json";
import {toUnix} from "../utils/locations";
import {generateCopyTasks} from "./base";

export interface Options {
  project: ProjectOptions;
  target: TestTarget;
  /**
   * Exit with an error code when an issue happens during the compilation.
   */
  strict?: boolean;
  tsOptions: {
    typescript: any
  };
}

/**
 * Generate a Mocha test target.
 *
 * @param gulp The gulp instance to use to register the tasks
 * @param targetName The name of the target, used to prefix the related tasks
 * @param options The target options, see Options
 */
export function generateTarget(gulp: Gulp, targetName: string, options: Options) {
  const rootDir: string = toUnix(options.project.root);
  const buildDir: string = path.join(rootDir, toUnix(options.project.buildDir), targetName);
  const srcDir: string = path.join(rootDir, toUnix(options.project.srcDir));

  const baseDir: string = path.join(srcDir, toUnix(options.target.baseDir));

  const typescriptOptions: buildTypescript.Options & tsconfigJson.Options = {
    strict: options.strict || true,
    tsOptions: options.tsOptions,
    typeRoots: options.target.typeRoots.map(toUnix),
    scripts: options.target.scripts,
    buildDir: buildDir,
    srcDir: srcDir,
    tsconfigPath: path.join(baseDir, "tsconfig.json")
  };

  buildTypescript.registerTask(gulp, targetName, typescriptOptions);
  tsconfigJson.registerTask(gulp, targetName, typescriptOptions);
  generateCopyTasks(gulp, targetName, srcDir, buildDir, options.target);

  gulp.task(`${targetName}:build`, gulp.parallel(`${targetName}:build:scripts`, `${targetName}:build:copy`));

  gulp.task(`${targetName}:clean`, function () {
    return del(buildDir);
  });

  gulp.task(`${targetName}:run`, testNode.generateTask(gulp, targetName, {testDir: buildDir}));

  gulp.task(`${targetName}`, gulp.series(`${targetName}:build`, `${targetName}:run`));
}
