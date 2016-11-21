import Bluebird = require("bluebird");
import {posix as path} from "path";
import del = require("del");
import {Gulp} from "gulp";

import {ProjectOptions, TestTarget} from "../config/config";

import * as buildTypescript from "../task-generators/build-typescript";
import * as generateTsconfig from "../task-generators/generate-tsconfig";
import * as testNode from "../task-generators/test-node";
import {toUnix} from "../utils/locations";

export interface Options {
  project: ProjectOptions;
  target: TestTarget;
  tsOptions: {
    typescript: any
  };
}

export function generateTarget(gulp: Gulp, targetName: string, options: Options) {
  const rootDir = toUnix(options.project.root);
  const buildDir: string = path.join(rootDir, toUnix(options.project.buildDir), targetName);
  const srcDir: string = path.join(rootDir, toUnix(options.project.srcDir));

  const baseDir: string = path.join(srcDir, toUnix(options.target.baseDir));

  const typescriptOptions: buildTypescript.Options & generateTsconfig.Options = {
    tsOptions: options.tsOptions,
    typeRoots: options.target.typeRoots.map(toUnix),
    scripts: options.target.scripts,
    buildDir: buildDir,
    srcDir: srcDir,
    tsconfigPath: path.join(baseDir, "tsconfig.json")
  };

  buildTypescript.registerTask(gulp, targetName, typescriptOptions);
  generateTsconfig.registerTask(gulp, targetName, typescriptOptions);

  // gulp.task(`${targetName}:watch`, function () {
  //   const sources = buildTypescript.getSources(typescriptOptions);
  //   gulp.watch(sources.scripts, {cwd: baseDir}, [`build:${targetName}`]);
  // });

  gulp.task(`${targetName}:build`, [`${targetName}:build:scripts`]);

  gulp.task(`${targetName}:clean`, function () {
    return del(buildDir);
  });

  gulp.task(
    `${targetName}`,
    [
      `${targetName}:build`
    ],
    testNode.generateTask(gulp, targetName, {testDir: buildDir})
  );
}
