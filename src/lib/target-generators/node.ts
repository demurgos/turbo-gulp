import {posix as path} from "path";
import {Gulp} from "gulp";
import {ProjectOptions, NodeTarget} from "../config/config";
import * as buildTypescript from "../task-generators/build-typescript";
import * as generateTsconfig from "../task-generators/generate-tsconfig";
import {toUnix} from "../utils/locations";
import del = require("del");
import {generateCopyTasks} from "./base";

export interface Options {
  project: ProjectOptions;
  target: NodeTarget;
  tsOptions: {
    typescript: any
  };
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
  generateCopyTasks(gulp, targetName, srcDir, buildDir, options.target);

  gulp.task(`${targetName}:build`, [`${targetName}:build:scripts`, `${targetName}:build:copy`]);

  gulp.task(`${targetName}:watch`, function () {
    const sources = buildTypescript.getSources(buildTypescriptOptions);
    gulp.watch(sources.scripts, {cwd: baseDir}, [`${targetName}:build`]);
  });

  gulp.task(`${targetName}:clean`, function () {
    return del(buildDir);
  });

  gulp.task(`${targetName}:dist`, [`${targetName}:clean`, `${targetName}:build`], function () {
    return del(distDir)
      .then((deleted: string[]) => {
        return gulp
          .src([path.join(buildDir, "**/*")], {base: buildDir})
          .pipe(gulp.dest(distDir));
      });
  });
}
