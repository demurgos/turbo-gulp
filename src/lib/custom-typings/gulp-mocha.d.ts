declare module "gulp-mocha" {
  type StaticGulpMocha = (options?: any) => any;
  const staticGulpMocha: StaticGulpMocha;
  export = staticGulpMocha;
}
