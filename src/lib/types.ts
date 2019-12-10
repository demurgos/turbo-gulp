/**
 * Utility types.
 *
 * This module mainly defines tagged strings to differentiate various kinds of paths.
 *
 * @module types
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Tagged } from "ts-tagged";

/**
 * Relative POSIX path.
 */
export type RelPosixPath = Tagged<string, "RelPosixPath">;

/**
 * Path, either POSIX or Windows.
 */
export type OsPath = Tagged<string, "OsPath">;
