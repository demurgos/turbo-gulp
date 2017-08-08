export interface TscOptions {
  allowJs?: boolean;
  allowSyntheticDefaultImports?: boolean;
  allowUnreachableCode?: boolean;
  allowUnusedLabels?: boolean;
  alwaysStrict?: boolean;
  baseUrl?: string;
  charset?: string;
  declaration?: boolean;
  declarationDir?: string;
  disableSizeLimit?: boolean;
  emitBOM?: boolean;
  emitDecoratorMetadata?: boolean;
  experimentalDecorators?: boolean;
  forceConsistentCasingInFileNames?: boolean;
  importHelpers?: boolean;
  inlineSourceMap?: boolean;
  inlineSources?: boolean;
  isolatedModules?: boolean;
  jsx?: "none" | "preserve" | "react";
  lib?: string[];
  locale?: string;
  mapRoot?: string;
  maxNodeModuleJsDepth?: number;
  module?: "none" | "commonjs" | "amd" | "umd" | "system" | "es2015";
  moduleResolution?: "classic" | "node";
  newLine?: "crlf" | "lf";
  noEmit?: boolean;
  noEmitHelpers?: boolean;
  noEmitOnError?: boolean;
  noErrorTruncation?: boolean;
  noFallthroughCasesInSwitch?: boolean;
  noImplicitAny?: boolean;
  noImplicitReturns?: boolean;
  noImplicitThis?: boolean;
  noUnusedLocals?: boolean;
  noUnusedParameters?: boolean;
  noImplicitUseStrict?: boolean;
  noLib?: boolean;
  noResolve?: boolean;
  out?: string;
  outDir?: string;
  outFile?: string;
  paths?: {[key: string]: string[]};
  preserveConstEnums?: boolean;
  project?: string;
  reactNamespace?: string;
  jsxFactory?: string;
  removeComments?: boolean;
  rootDir?: string;
  rootDirs?: string[];
  skipLibCheck?: boolean;
  skipDefaultLibCheck?: boolean;
  sourceMap?: boolean;
  sourceRoot?: string;
  strictNullChecks?: boolean;
  suppressExcessPropertyErrors?: boolean;
  suppressImplicitAnyIndexErrors?: boolean;
  target?: "es3" | "es5" | "es2015" | "es2016" | "es2017" | "next" | "latest";

  // Documented but not in ts.CompilerOptions:
  diagnostics?: boolean;
  listEmittedFiles?: boolean;
  listFiles?: boolean;
  pretty?: boolean;
  stripInternal?: boolean;
  typeRoots?: string[];
}

export const PROD_TSC_OPTIONS: TscOptions = {
  allowJs: false,
  allowSyntheticDefaultImports: false,
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  charset: "utf8",
  declaration: true,
  diagnostics: false,
  disableSizeLimit: false,
  emitBOM: false,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  forceConsistentCasingInFileNames: true,
  inlineSourceMap: false,
  inlineSources: false,
  isolatedModules: false,
  lib: ["es6"],
  listEmittedFiles: false,
  listFiles: false,
  locale: "en-us",
  module: "commonjs",
  moduleResolution: "node",
  newLine: "lf",
  noFallthroughCasesInSwitch: false,
  noImplicitAny: true,
  noImplicitReturns: true,
  noImplicitThis: true,
  noImplicitUseStrict: false,
  noResolve: false,
  noUnusedLocals: true,
  noUnusedParameters: false,
  preserveConstEnums: true,
  pretty: true,
  removeComments: false,
  skipLibCheck: false,
  skipDefaultLibCheck: false,
  sourceMap: false,
  strictNullChecks: true,
  stripInternal: true,
  suppressExcessPropertyErrors: false,
  suppressImplicitAnyIndexErrors: false,
  target: "es5",
};

export const DEV_TSC_OPTIONS: TscOptions = Object.assign({}, PROD_TSC_OPTIONS, {
  noUnusedLocals: false,
  preserveConstEnums: true,
  removeComments: false,
  sourceMap: true,
  stripInternal: false,
});

export default DEV_TSC_OPTIONS;
