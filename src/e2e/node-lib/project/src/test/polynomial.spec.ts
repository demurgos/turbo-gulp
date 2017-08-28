import { assert } from "chai";
import { Polynomial } from "../lib/polynomial";

describe("Polynomial", function () {
  it("normalize []", function () {
    const p: Polynomial = new Polynomial([]);
    assert.deepEqual(p.coefficients, []);
  });
  it("normalize [0]", function () {
    const p: Polynomial = new Polynomial([0]);
    assert.deepEqual(p.coefficients, []);
  });
  it("normalize [0, 0]", function () {
    const p: Polynomial = new Polynomial([0, 0]);
    assert.deepEqual(p.coefficients, []);
  });
  it("normalize [1, 0]", function () {
    const p: Polynomial = new Polynomial([1, 0]);
    assert.deepEqual(p.coefficients, [1]);
  });
  it("normalize [0, 1]", function () {
    const p: Polynomial = new Polynomial([0, 1]);
    assert.deepEqual(p.coefficients, [0, 1]);
  });
});
