/**
 * This module defines configuration for the typescript compilation tasks.
 *
 * @module options/clean
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { deleteUndefinedProperties } from "../utils/utils";

export { CompilerOptions } from "typescript";

// tslint:disable:max-line-length
/**
 * JSON variant of the compiler options, as found in `tsconfig.json`.
 *
 * @see https://github.com/Microsoft/TypeScript/blob/3118e812973687a63f530f72bfa9fd9d550a2de6/src/compiler/types.ts#L3520
 * @see https://github.com/Microsoft/TypeScript/blob/5a64556e4becb41ac33441a79562361df2bf793b/src/compiler/commandLineParser.ts#L11
 */

// tslint:enable
export interface TscOptions {
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
  esModuleInterop?: boolean;
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

export interface CustomTscOptions extends TscOptions {
  mjsModule?: "es2015" | "esnext";
}

export const DEFAULT_TSC_OPTIONS: CustomTscOptions = {
  allowJs: false,
  allowSyntheticDefaultImports: true,
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
  esModuleInterop: true,
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
  mjsModule: "esnext",
  module: "commonjs",
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
  noUnusedParameters: true,
  noImplicitUseStrict: false,
  noLib: false,
  noResolve: false,
  outDir: undefined,
  outFile: undefined,
  paths: undefined,
  preserveConstEnums: true,
  project: undefined,
  reactNamespace: undefined,
  jsxFactory: undefined,
  removeComments: false,
  rootDir: undefined,
  rootDirs: undefined,
  skipLibCheck: false,
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

/**
 * Merges two typescript compiler options.
 * The options of `extra` override the options of `base`.
 * It does not mutate the arguments.
 * If `extra` is undefined, returns a shallow copy of `base`.
 *
 * @param base Base options
 * @param extra Additional options
 * @return The merged TSC options
 */
export function mergeTscOptions(base: CustomTscOptions, extra?: CustomTscOptions): CustomTscOptions {
  return {...base, ...extra};
}

/**
 * Returns a shallow copy of `customOptions` where the custom and undefined options are removed.
 *
 * @param customOptions Base tsc options to standardize.
 * @return Standardized options.
 */
export function toStandardTscOptions(customOptions: CustomTscOptions): TscOptions {
  const result: TscOptions = mergeTscOptions(customOptions, {mjsModule: undefined});
  deleteUndefinedProperties(result);
  return result;
}

/**
 * Returns a boolean indicating if `.js` files will be emitted.
 *
 * @param customOptions Options to check.
 * @return Boolean indicating if `.js` files will be emitted.
 */
export function hasJsOutput(customOptions: CustomTscOptions): boolean {
  return customOptions.mjsModule === undefined || customOptions.module !== undefined;
}

/**
 * Returns a boolean indicating if `.mjs` files will be emitted.
 *
 * @param customOptions Options to check.
 * @return Boolean indicating if `.mjs` files will be emitted.
 */
export function hasMjsOutput(customOptions: CustomTscOptions): boolean {
  return customOptions.mjsModule !== undefined;
}
