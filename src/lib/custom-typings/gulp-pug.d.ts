declare module "gulp-pug" {
  type StaticGulpPug = (...args: any[]) => any;
  const staticGulpPug: StaticGulpPug;
  export = staticGulpPug;
}
