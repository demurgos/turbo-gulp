/**
 * This module defines extended Typescript options shared by multiple targets.
 *
 * @module typescript
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Furi, join as furiJoin, parent as furiParent } from "furi";
import { IMinimatch, Minimatch } from "minimatch";
import { CustomTscOptions } from "./options/tsc";
import { MatcherUri } from "./utils/matcher";

export interface TypescriptConfig {
  readonly tscOptions: CustomTscOptions;
  readonly tsconfigJson: Furi;
  readonly customTypingsDir?: Furi;
  readonly packageJson: Furi;
  readonly buildDir: Furi;
  readonly srcDir: Furi;
  readonly scripts: Iterable<MatcherUri>;
}

export interface ResolvedTsLocations {
  /**
   * Absolute path for the directory containing the `tsconfig.json` file.
   */
  readonly tsconfigJsonDir: Furi;

  /**
   * Absolute path for the `tsconfig.json` file.
   */
  readonly tsconfigJson: Furi;

  /**
   * Root directory containing the sources, relative to `tsconfigJsonDir`.
   */
  readonly rootDir: Furi;

  /**
   * If the typeRoots are not just `@types`, an array of type root directories, relative to `tsconfigJsonDir`.
   */
  readonly typeRoots: Furi[] | undefined;

  /**
   * Directory containing the build, relative to `tsconfigJsonDir`
   */
  readonly outDir: Furi;

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
  readonly absScripts: MatcherUri[];
}

export function resolveTsLocations(options: TypescriptConfig): ResolvedTsLocations {
  const tsconfigJson: Furi = options.tsconfigJson;
  const tsconfigJsonDir: Furi = new Furi(furiParent(tsconfigJson));

  const rootDir: Furi = options.srcDir;

  let typeRoots: Furi[] | undefined = undefined;
  if (options.customTypingsDir !== undefined) {
    const atTypesDir: Furi = furiJoin(furiParent(options.packageJson), "node_modules", "@types");
    typeRoots = [atTypesDir, options.customTypingsDir];
  }
  const outDir: Furi = options.buildDir;
  const relInclude: string[] = [];
  const relExclude: string[] = [];
  const absScripts: MatcherUri[] = [];

  for (const script of options.scripts) {
    const pattern: IMinimatch = new Minimatch(script.relativeFrom(tsconfigJsonDir));
    if (pattern.negate) {
      relExclude.push(pattern.pattern);
    } else {
      relInclude.push(pattern.pattern);
    }
    absScripts.push(script);
  }

  return {tsconfigJson, tsconfigJsonDir, rootDir, typeRoots, outDir, relInclude, relExclude, absScripts};
}
