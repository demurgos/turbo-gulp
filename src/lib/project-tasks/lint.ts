import * as path from "path";

import tslint = require("tslint");
import {default as gulpTslint} from "gulp-tslint";

import defaultTslintConfig from "../config/tslint";
import {ProjectOptions} from "../config/config";

export const taskName = "project:lint";

export interface Options {
  project: ProjectOptions;
  tslintOptions: {};
}

export function registerTask (gulp: any, {project, tslintOptions}: Options) {
  gulp.task(taskName, function(){
    const srcDir = path.resolve(project.root, project.srcDir);
    gulp.src(["**/*.ts"], {base: srcDir})
      .pipe(gulpTslint({
        configuration: defaultTslintConfig,
        formatter: "verbose",
        tslint: tslint
      }))
      .pipe(gulpTslint.report());
  });
}

export default registerTask;
