declare module "gulp-mocha" {
  interface StaticGulpMocha {
    (options?: any): any;
  }
  let staticGulpMocha: StaticGulpMocha;
  export = staticGulpMocha;
}
