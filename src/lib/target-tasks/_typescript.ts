import { IMinimatch, Minimatch } from "minimatch";
import { posix as posixPath } from "path";
import { CompilerOptionsJson } from "../options/tsc";
import { AbsPosixPath, RelPosixPath } from "../types";
import * as matcher from "../utils/matcher";

export interface TypescriptConfig {
  readonly tscOptions: CompilerOptionsJson;
  readonly tsconfigJson: AbsPosixPath | null;
  readonly customTypingsDir: AbsPosixPath | null;
  readonly packageJson: AbsPosixPath;
  readonly buildDir: AbsPosixPath;
  readonly srcDir: AbsPosixPath;
  readonly scripts: Iterable<string>;
}

export interface ResolvedTsLocations {
  /**
   * Absolute path for the directory containing the `tsconfig.json` file.
   */
  readonly tsconfigJsonDir: AbsPosixPath;

  /**
   * Absolute path for the `tsconfig.json` file.
   */
  readonly tsconfigJson: AbsPosixPath;

  /**
   * Root directory containing the sources, relative to `tsconfigJsonDir`.
   */
  readonly rootDir: RelPosixPath;

  /**
   * If the typeRoots are not just `@types`, an array of type root directories, relative to `tsconfigJsonDir`.
   */
  readonly typeRoots: RelPosixPath[] | undefined;

  /**
   * Directory containing the build, relative to `tsconfigJsonDir`
   */
  readonly outDir: RelPosixPath;

  /**
   * Patterns matching scripts to include, relative to `rootDir`.
   */
  readonly relInclude: string[];

  /**
   * Patterns matching scripts to exclude, relative to `rootDir`.
   */
  readonly relExclude: string[];

  /**
   * Patterns matching the scripts, relative to `rootDir`.
   */
  readonly absScripts: string[];
}

export function resolveTsLocations(options: TypescriptConfig): ResolvedTsLocations {
  const tsconfigJson: AbsPosixPath = options.tsconfigJson !== null ?
    options.tsconfigJson :
    posixPath.join(options.srcDir, "tsconfig.json");
  const tsconfigJsonDir: AbsPosixPath = posixPath.dirname(tsconfigJson);

  const rootDir: AbsPosixPath = options.srcDir;

  let typeRoots: AbsPosixPath[] | undefined = undefined;
  if (options.customTypingsDir !== null) {
    const atTypesDir: RelPosixPath = posixPath.join(posixPath.dirname(options.packageJson), "node_modules", "@types");
    typeRoots = [atTypesDir, options.customTypingsDir];
  }
  const outDir: AbsPosixPath = options.buildDir;
  const relInclude: string[] = [];
  const relExclude: string[] = [];
  const absScripts: string[] = [];

  for (const script of options.scripts) {
    const pattern: IMinimatch = matcher.relative(tsconfigJsonDir, new Minimatch(script));
    if (pattern.negate) {
      relExclude.push(pattern.pattern);
    } else {
      relInclude.push(pattern.pattern);
    }
    absScripts.push(script);
  }

  return {tsconfigJson, tsconfigJsonDir, rootDir, typeRoots, outDir, relInclude, relExclude, absScripts};
}
