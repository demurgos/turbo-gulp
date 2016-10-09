declare module "jspm"{
  interface StaticJspm{
    setPackagePath(path: string): any;
    install(fromPackage: boolean): any;
  }
  let staticJspm: StaticJspm;
  export = staticJspm;
}
