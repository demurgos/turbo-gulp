declare module "gulp-typedoc" {
  type StaticGulpTypedoc = (...args: any[]) => any;
  const staticGulpTypedoc: StaticGulpTypedoc;
  export = staticGulpTypedoc;
}
