declare module "gulp-mocha" {
  // tslint:disable-next-line:callable-types
  interface StaticGulpMocha {
    (options?: any): any;
  }
  const staticGulpMocha: StaticGulpMocha;
  export = staticGulpMocha;
}
