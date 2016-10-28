declare module "gulp-pug" {
  interface StaticGulpPug {
    (...args: any[]): any;
  }
  let staticGulpPug: StaticGulpPug;
  export = staticGulpPug;
}
