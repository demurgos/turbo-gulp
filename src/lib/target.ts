import { CleanOptions } from "./options/clean";
import { CopyOptions } from "./options/copy";
import { TypescriptOptions } from "./options/typescript";

/**
 * A target represents a group of tasks to produce a specific build.
 */
export interface Target {
  /**
   * Name of the target, used to prefix related tasks
   */
  name: string;

  /**
   * Name of the target directory, relative to `project.buildDir`.
   * Default: `target.name`.
   */
  targetDir?: string;

  /**
   * Source directory for this target, relative to `project.srcDir`.
   */
  srcDir?: string;

  /**
   * List of minimatch glob patterns matching the Typescript scripts, relative
   * to `target.srcDir`.
   */
  scripts: string[];

  /**
   * List of directories where Typescript should search for declarations,
   * relative to `target.srcDir`.
   */
  typeRoots: string[];

  /**
   * Advanced typescript configuration
   */
  typescript?: TypescriptOptions;

  /**
   * A list of copy operations to perform during the build process.
   */
  copy?: CopyOptions[];

  /**
   * Description of the files to clean, **relative to `project.root`**.
   *
   * Default:
   * {
   *   dirs: [
   *     path.join(project.buildDir, target.targetDir),
   *     path.join(project.distDir, target.targetDir)
   *   ]
   * }
   */
  clean?: CleanOptions;
}
