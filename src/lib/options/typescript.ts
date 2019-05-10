/**
 * This module defines configuration for the general Typescript tasks (e.g. compilation and lint).
 *
 * @module options/clean
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import * as ts from "typescript";
import { CustomTscOptions, DEFAULT_TSC_OPTIONS, mergeTscOptions, TscOptions } from "./tsc";

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
  tscOptions?: CustomTscOptions;

  /**
   * A list of paths where you should generate a `tsconfig.json` file.
   *
   * If used in a project: relative to `project.root`
   * If used in a target: relative to `project.src`.
   *
   * Merge rule: Last write win.
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
   * Merge rule: Shallow merge.
   */
  tscOptions: CustomTscOptions;

  /**
   * A list of paths where you should generate a `tsconfig.json` file.
   *
   * If used in a project: relative to `project.root`
   * If used in a target: relative to `project.src`.
   *
   * Merge rule: Last write win.
   */
  tsconfigJson: string[];
}

export const DEFAULT_TYPESCRIPT_OPTIONS: TypescriptOptions = {
  tscOptions: DEFAULT_TSC_OPTIONS,
  tsconfigJson: ["tsconfig.json"],
};

export function mergeTypescriptOptions(
  base: TypescriptOptions,
  extra?: TypescriptOptions,
): TypescriptOptions {
  let tscOptions: TscOptions | undefined;
  if (extra !== undefined && extra.tscOptions !== undefined) {
    if (base.tscOptions !== undefined) {
      tscOptions = mergeTscOptions(base.tscOptions, extra.tscOptions);
    } else {
      tscOptions = extra.tscOptions;
    }
  } else {
    if (base.tscOptions !== undefined) {
      tscOptions = base.tscOptions;
    } else {
      tscOptions = undefined;
    }
  }
  return {...base, ...extra, tscOptions};
}
