declare module "merge2"{
  interface StaticMerge2{
    (streams: any[]): any;
  }
  let staticMerge2: StaticMerge2;
  export = staticMerge2;
}
