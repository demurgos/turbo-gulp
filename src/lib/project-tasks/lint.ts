import {resolve as resolvePath} from "path";
import {Gulp} from "gulp";

import tslint = require("tslint");
import {default as gulpTslint} from "gulp-tslint";

import defaultTslintConfig from "../config/tslint";
import {ProjectOptions} from "../config/config";

export const taskName = "project:lint";

export interface Options {
  project: ProjectOptions;
  tslintOptions: {};
}

export function registerTask (gulp: Gulp, {project, tslintOptions}: Options) {
  const options = Object.assign({}, {
    configuration: defaultTslintConfig,
    formatter: "verbose",
    tslint: tslint
  }, tslintOptions);

  gulp.task(taskName, function(){
    const srcDir = resolvePath(project.root, project.srcDir);
    const sources = resolvePath(srcDir, "**/*.ts");
    gulp.src([sources], {base: srcDir})
      .pipe(gulpTslint(options))
      .pipe(gulpTslint.report());
  });
}

export default registerTask;
