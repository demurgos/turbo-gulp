declare module "gulp-typescript"{
  interface StaticGulpTypescript{
    (tsConfig: any): any;
  }
  let staticGulpTypescript: StaticGulpTypescript;
  export = staticGulpTypescript;
}
