import Bluebird = require("bluebird");
import {posix as path} from "path";
import del = require("del");
import {Gulp} from "gulp";

import {ProjectOptions, NodeTarget} from "../config/config";

import * as buildTypescript from "../task-generators/build-typescript";
import * as generateTsconfig from "../task-generators/generate-tsconfig";

export interface Options {
  project: ProjectOptions;
  target: NodeTarget;
  tsOptions: {
    typescript: any
  };
}

function toUnix(p: string): string {
  return p.replace(/\\/g, "/");
}

export function generateTarget(gulp: Gulp, targetName: string, options: Options) {
  const rootDir = toUnix(options.project.root);
  const buildDir: string = path.join(rootDir, toUnix(options.project.buildDir), targetName);
  const srcDir: string = path.join(rootDir, toUnix(options.project.srcDir));
  const distDir: string = path.join(rootDir, toUnix(options.project.distDir), targetName);

  const baseDir: string = path.join(srcDir, toUnix(options.target.baseDir));

  const buildTypescriptOptions: buildTypescript.Options = {
    tsOptions: options.tsOptions,
    typeRoots: options.target.typeRoots.map(toUnix),
    scripts: options.target.scripts,
    buildDir: buildDir,
    srcDir: srcDir
  };

  const generateTsconfigOptions: generateTsconfig.Options = Object.assign({}, buildTypescriptOptions, {
    tsconfigPath: path.join(baseDir, "tsconfig.json")
  });

  buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);
  generateTsconfig.registerTask(gulp, targetName, generateTsconfigOptions);

  gulp.task(`watch:${targetName}`, function () {
    const sources = buildTypescript.getSources(buildTypescriptOptions);
    gulp.watch(sources.scripts, {cwd: baseDir}, [`build:${targetName}`]);
  });

  gulp.task(`build:${targetName}`, [`build:${targetName}:scripts`]);

  gulp.task(`clean:${targetName}`, function () {
    return del(buildDir);
  });

  gulp.task(`dist:${targetName}`, [`clean:${targetName}`, `build:${targetName}`], function () {
    return del(distDir)
      .then((deleted: string[]) => {
        return gulp
          .src([path.join(buildDir, "**/*")], {base: buildDir})
          .pipe(gulp.dest(distDir));
      });
  });
}
