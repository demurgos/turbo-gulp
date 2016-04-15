declare module "gulp-tslint"{
  interface StaticGulpTsLint{
    report(reporterName: string): any;
    (options?: any): any;
  }
  let staticGulpTsLint: StaticGulpTsLint;
  export = staticGulpTsLint;
}
