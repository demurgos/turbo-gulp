/**
 * This module defines configuration for the copy tasks.
 *
 * @module options/clean
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

/**
 * CopyOptions describes a copy operation required to build a target.
 */
export interface CopyOptions {
  /**
   * Base directory of the files to copy. Relative to target.srcDir
   * Default: target.srcDir
   */
  src?: string;

  /**
   * A list of minimatch patterns
   */
  files: string[];

  /**
   * Target directory of the copy, relative to the target output directory.
   * Default: target output directory
   */
  dest?: string;
}
