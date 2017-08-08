/**
 * PugOptions describes a pug operation required to build a target.
 */
export interface PugOptions {
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
   * Default: target.buildDir/targetName output directory
   */
  dest?: string;

  /**
   * Name of the pug operation.
   */
  name?: string;

  /**
   * GulpPug webpackOptions
   */
  options?: {locals?: {}};
}
