import * as install from "gulp-install";

// TODO: move to custom definitions
declare module "gulp-install"{
  interface StaticGulpInstall{
    (): any;
  }
  let staticGulpInstall: StaticGulpInstall;
  export = staticGulpInstall;
}

export default function registerTask (gulp, locations) {
  gulp.task('install.npm', function () {
    return gulp.src([locations.getPackage()])
      .pipe(install());
  });
};
