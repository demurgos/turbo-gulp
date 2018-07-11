import chai from "chai";
import { Polynomial } from "../lib/polynomial";

describe("Polynomial", function () {
  it("normalize []", function () {
    const p: Polynomial = new Polynomial([]);
    chai.assert.deepEqual(p.coefficients, []);
  });
  it("normalize [0]", function () {
    const p: Polynomial = new Polynomial([0]);
    chai.assert.deepEqual(p.coefficients, []);
  });
  it("normalize [0, 0]", function () {
    const p: Polynomial = new Polynomial([0, 0]);
    chai.assert.deepEqual(p.coefficients, []);
  });
  it("normalize [1, 0]", function () {
    const p: Polynomial = new Polynomial([1, 0]);
    chai.assert.deepEqual(p.coefficients, [1]);
  });
  it("normalize [0, 1]", function () {
    const p: Polynomial = new Polynomial([0, 1]);
    chai.assert.deepEqual(p.coefficients, [0, 1]);
  });
});
