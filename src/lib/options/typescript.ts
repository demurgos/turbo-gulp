import * as ts from "typescript";
import { CompilerOptionsJson, DEFAULT_PROJECT_TSC_OPTIONS, mergeTscOptionsJson } from "./tsc";

/**
 * Typescript options, can be applied both to the project or for specific targets.
 */
export interface TypescriptOptions {
  /**
   * Typescript instance to use for compilation.
   *
   * Merge rule: Last write win.
   */
  typescript?: typeof ts;

  /**
   * Exit with non-null return code on any error when building the scripts.
   * In watch mode, the errors are reported but the process does not stop (`strict: false`).
   *
   * Default: `true`.
   * Merge rule: Last write win.
   */
  strict?: boolean;

  /**
   * Override the default compiler options.
   * These options are passed to `gulp-typescript` and used when emiting `tsconfig.json` files.
   *
   * Merge rule: Shallow merge (`actual = {...default, ...project, ...target}`).
   */
  compilerOptions?: CompilerOptionsJson;

  /**
   * A list of paths where you should generate a `tsconfig.json` file.
   *
   * If used in a project: relative to `project.root`
   * If used in a target: relative to `project.src`.
   *
   * Merge rule: Last write win (no array merge).
   */
  tsconfigJson?: string[];
}

/**
 * Typescript options, can be applied both to the project or for specific targets.
 */
export interface CompleteTypescriptOptions extends TypescriptOptions {
  /**
   * Typescript instance to use for compilation.
   *
   * Merge rule: Last write win.
   */
  typescript: typeof ts;

  /**
   * Exit with non-null return code on any error when building the scripts.
   * In watch mode, the errors are reported but the process does not stop (`strict: false`).
   *
   * Default: `true`.
   * Merge rule: Last write win.
   */
  strict?: boolean;

  /**
   * Override the default compiler options.
   * These options are passed to `gulp-typescript` and used when emiting `tsconfig.json` files.
   *
   * Merge rule: Shallow merge (`actual = {...default, ...project, ...target}`).
   */
  compilerOptions: CompilerOptionsJson;

  /**
   * A list of paths where you should generate a `tsconfig.json` file.
   *
   * If used in a project: relative to `project.root`
   * If used in a target: relative to `project.src`.
   *
   * Merge rule: Last write win (no array merge).
   */
  tsconfigJson: string[];
}

export const DEFAULT_PROJECT_TS_OPTIONS: TypescriptOptions = {
  compilerOptions: DEFAULT_PROJECT_TSC_OPTIONS,
  tsconfigJson: ["tsconfig.json"],
};

export function mergeTypescriptOptions(
  base: TypescriptOptions,
  extra?: TypescriptOptions,
): TypescriptOptions {
  let compilerOptions: CompilerOptionsJson | undefined;
  if (extra !== undefined && extra.compilerOptions !== undefined) {
    if (base.compilerOptions !== undefined) {
      compilerOptions = mergeTscOptionsJson(base.compilerOptions, extra.compilerOptions);
    } else {
      compilerOptions = extra.compilerOptions;
    }
  } else {
    if (base.compilerOptions !== undefined) {
      compilerOptions = base.compilerOptions;
    } else {
      compilerOptions = undefined;
    }
  }
  return {...base, ...extra, compilerOptions};
}
