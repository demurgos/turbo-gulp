/**
 * This module defines the `requireAll` function and its options.
 *
 * The goal of this function is to generate scripts that statically require or
 * import a list of dependencies.
 *
 * @module require-all
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import fs from "fs";
import glob from "glob";
import { Minimatch } from "minimatch";
import path from "path";
import { toPosix } from "./project";
import { AbsPosixPath, RelPosixPath } from "./types";
import * as matcher from "./utils/matcher";

export interface RequireAllOptions {
  /**
   * `glob` patterns matching the files to select.
   */
  sources: string;

  /**
   * Base directory for wildstar `**` expansion.
   *
   * Absolute POSIX path.
   */
  base: AbsPosixPath;

  /**
   * Target file where the result will be written.
   *
   * Relative POSIX path, resolved from `.base`.
   */
  target: RelPosixPath;

  /**
   * Output mode.
   * - `"cjs"` means to use a sequence of `require(...)`.
   * - `"esm"` means to use a sequence of `await import(...)`
   */
  mode: "cjs" | "esm";

  /**
   * Optional source text to add in the IIFE after all the dependencies were
   * required.
   */
  suffix?: string;
}

export async function requireAll(options: RequireAllOptions): Promise<void> {
  const absSources: string = matcher.asString(matcher.join(options.base, new Minimatch(options.sources)));
  const absTarget: AbsPosixPath = path.posix.join(options.base, options.target);
  const absTargetDir: AbsPosixPath = path.posix.dirname(absTarget);

  const matches: string[] = await new Promise<string[]>((resolve, reject) => {
    glob(absSources, (err: Error | null, matches: string[]): void => {
      if (err !== null) {
        reject(err);
        return;
      }
      resolve(matches);
    });
  });

  const specifiers: ReadonlyArray<string> = matches.map((match: string): string => {
    const specifier: string = path.posix.relative(absTargetDir, toPosix(match));
    if (path.posix.isAbsolute(specifier) || specifier.startsWith("./") || specifier.startsWith("../")) {
      return specifier;
    }
    return `./${specifier}`;
  });

  const sourceText: string = generateSourceText(specifiers, options.mode, options.suffix);
  return fs.promises.writeFile(absTarget, Buffer.from(sourceText));
}

/**
 * Generates the source text to import all the specifiers.
 *
 * The imports are wrapped in an IIFE.
 *
 * @param specifiers Sequence of specifiers to import.
 * @param mode `"cjs"` to use a sequence of `require(...)`, `"esm"` to
 *              use `await import(...)`.
 * @param suffix Raw source text to execute after all the imports are completed.
 * @return Source text for the module body.
 */
function generateSourceText(specifiers: ReadonlyArray<string>, mode: "esm" | "cjs", suffix?: string): string {
  const lines: string[] = [];
  lines.push(mode === "esm" ? "(async () => {" : "(() => {");
  for (const specifier of specifiers) {
    const stmtStart: string = mode === "esm" ? "await import" : "require";
    lines.push(`  ${stmtStart}(${JSON.stringify(specifier)});`);
  }
  if (suffix !== undefined) {
    lines.push(suffix);
  }
  lines.push("})();\n");
  return lines.join("\n");
}
