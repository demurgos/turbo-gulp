import {Gulp} from "gulp";
import {default as gulpTslint, PluginOptions as GulpTslintOptions} from "gulp-tslint";
import {join as joinPath} from "path";
import tslint = require("tslint");

import {ProjectOptions} from "../config/config";
import defaultTslintConfig from "../config/tslint";

export const taskName: string = ":lint";

export interface Options {
  project: ProjectOptions;
  tslintOptions: {};
}

export function registerTask(gulp: Gulp, {project, tslintOptions}: Options) {
  const options: GulpTslintOptions = Object.assign({}, {
    configuration: defaultTslintConfig,
    formatter: "verbose",
    tslint: tslint
  }, tslintOptions);

  gulp.task(taskName, function () {
    const srcDir: string = joinPath(project.root, project.srcDir);
    const sources: string = joinPath(srcDir, "**/*.ts");
    return gulp.src([sources], {base: srcDir})
      .pipe(gulpTslint(options))
      .pipe(gulpTslint.report());
  });
}

export default registerTask;
