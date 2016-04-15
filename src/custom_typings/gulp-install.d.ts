declare module "gulp-install"{
  interface StaticGulpInstall{
    (): any;
  }
  let staticGulpInstall: StaticGulpInstall;
  export = staticGulpInstall;
}
