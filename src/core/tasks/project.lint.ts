import * as path from 'path';

import tslint from "gulp-tslint";

import defaultTslintConfig from '../config/tslint';
import Locations from "../config/locations";

export default function registerTask (gulp:any, locations: Locations, userOptions?: any) {
  gulp.task('project.lint', function(){
    let sources: string[] = [];
    sources.push(locations.config.core.base);
    sources.push(locations.config.targets.node.base);
    sources.push(locations.config.targets.browser.base);

    sources = sources.map((relativePath:string) => path.join(locations.config.project.root, relativePath, '**/*.ts'));

    gulp.src(sources, {base: locations.config.project.root})
      .pipe(tslint({
        configuration: defaultTslintConfig
      }))
      .pipe(tslint.report("verbose"));
  });
};

