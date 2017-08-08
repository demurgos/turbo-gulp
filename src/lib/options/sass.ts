/**
 * Describes a sass operation required to build a target.
 */
export interface SassOptions {
  /**
   * Base directory of the files to copy. Relative to srcDir
   * Default: srcDir
   */
  src?: string;

  /**
   * A list of minimatch patterns
   */
  files?: string[];

  /**
   * Target directory of the copy, relative to the target output directory.
   * Default: target output directory
   */
  dest?: string;

  /**
   * Name of the sass operation.
   */
  name?: string;

  /**
   * GulpSass webpackOptions
   */
  options?: {
    outputStyle?: "compressed" | string;
  };
}
