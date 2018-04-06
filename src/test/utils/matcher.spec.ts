import chai from "chai";
import minimatch from "minimatch";
import * as matcher from "../../lib/utils/matcher";

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
      const actual: string = matcher.asString(new minimatch.Minimatch(pattern));
      chai.assert.equal(actual, pattern);
    });
  }
});
