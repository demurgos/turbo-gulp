import { assert } from "chai";
import { Minimatch } from "minimatch";
import * as matcher from "./matcher";

describe("matcher.asString", function () {
  const data: string[] = [
    "",
    "a",
    "a/b",
    "*",
    "**",
    "**/*",
  ];

  for (const pattern of data) {
    it(`should preserve the pattern ${JSON.stringify(pattern)}`, function () {
      const actual: string = matcher.asString(new Minimatch(pattern));
      assert.equal(actual, pattern);
    });
  }
});
