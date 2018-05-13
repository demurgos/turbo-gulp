import { Tagged } from "ts-tagged";

/**
 * Relative POSIX path.
 */
export type RelPosixPath = Tagged<string, "RelPosixPath">;

/**
 * Absolute POSIX path.
 */
export type AbsPosixPath = Tagged<string, "AbsPosixPath">;

/**
 * Path, either POSIX or Windows.
 */
export type OsPath = Tagged<string, "OsPath">;

/**
 * POSIX path, either absolute or relative.
 */
export type PosixPath = RelPosixPath | AbsPosixPath;
