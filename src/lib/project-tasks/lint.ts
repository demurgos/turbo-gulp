import {join as joinPath} from "path";
import {Gulp} from "gulp";
import {default as gulpTslint} from "gulp-tslint";
import defaultTslintConfig from "../config/tslint";
import {ProjectOptions} from "../config/config";

import tslint = require("tslint");

export const taskName = ":lint";

export interface Options {
  project: ProjectOptions;
  tslintOptions: {};
}

export function registerTask(gulp: Gulp, {project, tslintOptions}: Options) {
  const options = Object.assign({}, {
    configuration: defaultTslintConfig,
    formatter: "verbose",
    tslint: tslint
  }, tslintOptions);

  gulp.task(taskName, function () {
    const srcDir = joinPath(project.root, project.srcDir);
    const sources = joinPath(srcDir, "**/*.ts");
    return gulp.src([sources], {base: srcDir})
      .pipe(gulpTslint(options))
      .pipe(gulpTslint.report());
  });
}

export default registerTask;
