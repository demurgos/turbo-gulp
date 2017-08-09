export {CompilerOptions} from "typescript";

/* tslint:disable:max-line-length */
/**
 * JSON variant of the compiler options, as found in `tsconfig.json`.
 *
 * @see https://github.com/Microsoft/TypeScript/blob/3118e812973687a63f530f72bfa9fd9d550a2de6/src/compiler/types.ts#L3520
 * @see https://github.com/Microsoft/TypeScript/blob/5a64556e4becb41ac33441a79562361df2bf793b/src/compiler/commandLineParser.ts#L11
 */

/* tslint:enable */
export interface CompilerOptionsJson {
  allowJs?: boolean;
  allowSyntheticDefaultImports?: boolean;
  allowUnreachableCode?: boolean;
  allowUnusedLabels?: boolean;
  alwaysStrict?: boolean;
  baseUrl?: string;
  charset?: string;
  checkJs?: boolean;
  declaration?: boolean;
  declarationDir?: string;
  disableSizeLimit?: boolean;
  downlevelIteration?: boolean;
  emitBOM?: boolean;
  emitDecoratorMetadata?: boolean;
  experimentalDecorators?: boolean;
  forceConsistentCasingInFileNames?: boolean;
  importHelpers?: boolean;
  inlineSourceMap?: boolean;
  inlineSources?: boolean;
  isolatedModules?: boolean;
  jsx?: "preserve" | "react" | "react-native";
  lib?: string[];
  locale?: string;
  mapRoot?: string;
  maxNodeModuleJsDepth?: number;
  module?: "none" | "commonjs" | "amd" | "umd" | "system" | "es2015" | "esnext";
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
  noStrictGenericChecks?: boolean;
  noUnusedLocals?: boolean;
  noUnusedParameters?: boolean;
  noImplicitUseStrict?: boolean;
  noLib?: boolean;
  noResolve?: boolean;
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
  sourceMap?: boolean;
  sourceRoot?: string;
  strict?: boolean;
  strictNullChecks?: boolean;
  suppressExcessPropertyErrors?: boolean;
  suppressImplicitAnyIndexErrors?: boolean;
  target?: "es3" | "es5" | "es6" | "es2015" | "es2016" | "es2017" | "esnext";
  traceResolution?: boolean;
  types?: string[];
  typeRoots?: string[];
}

export const DEFAULT_PROJECT_TSC_OPTIONS: CompilerOptionsJson = {
  allowJs: true,
  allowSyntheticDefaultImports: false,
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  alwaysStrict: true,
  baseUrl: undefined,
  charset: "utf8",
  checkJs: false,
  declaration: false,
  declarationDir: undefined,
  disableSizeLimit: false,
  downlevelIteration: false,
  emitBOM: false,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  forceConsistentCasingInFileNames: true,
  importHelpers: false,
  inlineSourceMap: false,
  inlineSources: false,
  isolatedModules: false,
  jsx: undefined,
  lib: ["es2017", "esnext.asynciterable"],
  locale: "en-us",
  mapRoot: undefined,
  maxNodeModuleJsDepth: undefined,
  module: "es2015",
  moduleResolution: "node",
  newLine: "lf",
  noEmit: false,
  noEmitHelpers: false,
  noEmitOnError: true,
  noErrorTruncation: true,
  noFallthroughCasesInSwitch: true,
  noImplicitAny: true,
  noImplicitReturns: true,
  noImplicitThis: true,
  noStrictGenericChecks: false,
  noUnusedLocals: true,
  noUnusedParameters: false,
  noImplicitUseStrict: false,
  noLib: false,
  noResolve: false,
  outDir: undefined,
  outFile: undefined,
  paths: undefined,
  preserveConstEnums: false,
  project: undefined,
  reactNamespace: undefined,
  jsxFactory: undefined,
  removeComments: false,
  rootDir: undefined,
  rootDirs: undefined,
  skipLibCheck: true,
  sourceMap: true,
  sourceRoot: undefined,
  strict: true,
  strictNullChecks: true,
  suppressExcessPropertyErrors: false,
  suppressImplicitAnyIndexErrors: false,
  target: "es2017",
  traceResolution: false,
  types: undefined,
  typeRoots: undefined,
};

export const PROD_TSC_OPTIONS: CompilerOptionsJson = {
  ...DEFAULT_PROJECT_TSC_OPTIONS,
  allowJs: false,
  declaration: true,
  module: "commonjs",
  removeComments: false,
  skipLibCheck: false,
};

export const DEV_TSC_OPTIONS: CompilerOptionsJson = {
  ...PROD_TSC_OPTIONS,
  noUnusedLocals: false,
  preserveConstEnums: true,
  removeComments: false,
  sourceMap: true,
};

/**
 * Merges two typescript compiler options.
 * The options of `extra` overide the options of `base`.
 * It does not mutate the arguments.
 * If `extra` is undefined, returns a shallow copy of `base`.
 *
 * @param base Base options
 * @param extra Additional options
 * @return The merged TSC options
 */
export function mergeTscOptionsJson(
  base: CompilerOptionsJson,
  extra?: CompilerOptionsJson,
): CompilerOptionsJson {
  return {...base, ...extra};
}
