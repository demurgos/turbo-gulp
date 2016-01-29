import * as jspm from 'jspm';

import Locations from "../config/locations";

// TODO: move to custom definitions
declare module 'jspm'{
  interface StaticJspm{
    setPackagePath(path: string): any;
    install(fromPackage: boolean): any;
  }
  let staticJspm: StaticJspm;
  export = staticJspm;
}

export default function registerTask (gulp:any, locations: Locations) {
  gulp.task('install.jspm', function () {
    jspm.setPackagePath(locations.config.project.root);
    return jspm.install(true);
  });
};
