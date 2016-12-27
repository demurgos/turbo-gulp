declare module "merge2" {
  // tslint:disable-next-line:callable-types
  interface StaticMerge2 {
    (streams: any[]): any;
  }
  const staticMerge2: StaticMerge2;
  export = staticMerge2;
}
