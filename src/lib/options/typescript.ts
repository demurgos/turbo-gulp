import * as ts from "typescript";
import {TscOptions} from "./tsc";

export interface TypescriptOptions {
  /**
   * Typescript instance to use for compilation.
   */
  typescript?: typeof ts;

  /**
   * Exit with non-null return code on any error
   */
  strict?: boolean;

  /**
   * Override default options
   */
  compilerOptions?: TscOptions;
  /**
   * A list of paths where you should generate a `tsconfig.json` file.
   * Relative to `project.src`.
   */
  tsconfigJson: string[];
}
