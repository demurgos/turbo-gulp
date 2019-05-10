/**
 * Miscellaneous utils.
 *
 * @module utils/utils
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

export function deleteUndefinedProperties(obj: any): void {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
}
