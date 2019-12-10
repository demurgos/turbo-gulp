/**
 * Helper functions to manipulate Minimatch patterns.
 *
 * @module utils/matcher
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Furi, join as furiJoin, relative as furiRelative } from "furi";
import { Incident } from "incident";
import minimatch, { IMinimatch } from "minimatch";
import path from "path";

export class MatcherUri {
  private readonly furi: Furi;
  private readonly negate: boolean;

  private constructor(furi: Furi, negate: boolean) {
    this.furi = furi;
    this.negate = negate;
  }

  public static from(base: Furi, pattern: string): MatcherUri {
    const mmatch: minimatch.IMinimatch = new minimatch.Minimatch(pattern);

    if (mmatch.comment || mmatch.empty) {
      throw new Incident("InvalidMinimatchPattern", {pattern});
    }

    const furi: Furi = furiJoin(base, mmatch.pattern);

    return new MatcherUri(furi, mmatch.negate);
  }

  /**
   * Computes an equivalent Minimatch pattern relative to the provided directory.
   *
   * Similar to Node's `path.relative`.
   *
   * If the Minimatch pattern is a comment, returns a copy.
   *
   * @param from POSIX path (relative or absolute) from where the new pattern is computed
   * @param matcher Parsed Minimatch pattern.
   * @return New Minimatch pattern relative to `from`
   */
  public relativeFrom(from: Furi): string {
    const relativePattern: string = furiRelative(from, this.furi);
    return this.negate ? `!${relativePattern}` : relativePattern;
  }

  public toMinimatchString(): string {
    const mmatch: minimatch.IMinimatch = new minimatch.Minimatch(this.furi.toSysPath());
    mmatch.negate = this.negate;
    return asString(mmatch);
  }

  public toMinimatch(): IMinimatch {
    return new minimatch.Minimatch(this.toMinimatchString());
  }
}

/**
 * Joins a prefix (POSIX path) with a parsed Minimatch pattern.
 *
 * It can be used to restrict a Minimatch pattern to a subdirectory:
 * ```
 * const jsFiles = new Minimatch("**\/*.js");
 * const jsFilesInBuildExample = join("build/example", jsFiles);
 * ```
 *
 * This acts as a generalization of Node's `path.join` over Minimatch patterns.
 *
 * If the Minimatch pattern is a comment or can be interpreted as an absolute POSIX path (ie. starts with `/`),
 * an unprefixed copy of `matcher` is returned.
 *
 * @param prefix Left side of the join, must be a POSIX path (relative or absolute)
 * @param matcher Parsed Minimatch pattern.
 * @return New Minimatch pattern resulting from joining `prefix` with `matcher`.
 */
export function join(prefix: string, matcher: minimatch.IMinimatch): minimatch.IMinimatch {
  let result: minimatch.IMinimatch;

  if (matcher.comment || path.posix.isAbsolute(matcher.pattern)) {
    result = new minimatch.Minimatch(matcher.pattern);
  } else {
    result = new minimatch.Minimatch(path.posix.join(prefix, matcher.pattern), matcher.options);
  }

  result.negate = matcher.negate;

  return result;
}

/**
 * Converts a parsed Minimatch pattern back to a string.
 *
 * @param matcher Parsed Minimatch pattern to stringify.
 * @return String corresponding to `matcher`.
 */
export function asString(matcher: minimatch.IMinimatch): string {
  return matcher.negate ? `!${matcher.pattern}` : matcher.pattern;
}
