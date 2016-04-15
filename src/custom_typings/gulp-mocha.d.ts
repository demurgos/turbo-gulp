declare module "gulp-mocha"{
  interface StaticMocha{
    (options?: any): any;
  }
  let staticMocha: StaticMocha;
  export = staticMocha;
}
