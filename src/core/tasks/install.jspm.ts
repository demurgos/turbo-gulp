import * as jspm from 'jspm';

// TODO: move to custom definitions
declare module 'jspm'{
  interface StaticJspm{
    setPackagePath(path: string): any;
    install(fromPackage: boolean): any;
  }
  let staticJspm: StaticJspm;
  export = staticJspm;
}

export default function registerTask (gulp, locations) {
  gulp.task('install.jspm', function () {
    jspm.setPackagePath(locations.getRootDir());
    return jspm.install(true);
  });
};
