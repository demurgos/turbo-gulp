declare module "gulp-pug" {
  // tslint:disable-next-line:callable-types
  interface StaticGulpPug {
    (...args: any[]): any;
  }
  const staticGulpPug: StaticGulpPug;
  export = staticGulpPug;
}
