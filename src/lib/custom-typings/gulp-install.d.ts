declare module "gulp-install" {
  // tslint:disable-next-line:callable-types
  interface StaticGulpInstall {
    (): any;
  }
  const staticGulpInstall: StaticGulpInstall;
  export = staticGulpInstall;
}
