import * as install from "gulp-install";

import Locations from "../config/locations";

// TODO: move to custom definitions
declare module "gulp-install"{
  interface StaticGulpInstall{
    (): any;
  }
  let staticGulpInstall: StaticGulpInstall;
  export = staticGulpInstall;
}

export default function registerTask (gulp:any, locations: Locations) {
  gulp.task('install.npm', function () {
    return gulp.src([locations.config.project.package])
      .pipe(install());
  });
};
