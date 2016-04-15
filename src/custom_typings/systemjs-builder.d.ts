declare module "systemjs-builder"{
  interface StaticBuilder{
    new (projectRoot: string, systemjsConfigPath: string): Builder;
  }

  interface Builder{
    build(entryPointPath: string, ouputFile: string): any;
    buildStatic(entryPointPath: string, ouputFile: string): any;
  }

  let systemjsBuilder: StaticBuilder;

  export = systemjsBuilder;
}
