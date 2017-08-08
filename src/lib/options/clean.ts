export interface CleanOptions {
  /**
   * List of relative paths from `project.root` to directories to delete.
   */
  dirs?: string[];

  /**
   * List of relative minimatch patterns from `project.root` to files to delete.
   */
  files?: string[];
}
