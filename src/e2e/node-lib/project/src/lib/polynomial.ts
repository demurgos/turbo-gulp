export class Polynomial {
  coefficients: number[];

  constructor(coefficients: number[] = []) {
    this.coefficients = coefficients;
    this.normalize();
  }

  addAssign(rhs: Polynomial): this {
    const nextCoefficients: number[] = new Array(Math.max(this.coefficients.length, rhs.coefficients.length));
    for (let i: number = 0; i < nextCoefficients.length; i++) {
      nextCoefficients[i] = 0;
      if (i < this.coefficients.length) {
        nextCoefficients[i] += this.coefficients[i];
      }
      if (i < rhs.coefficients.length) {
        nextCoefficients[i] += rhs.coefficients[i];
      }
    }
    this.coefficients = nextCoefficients;
    return this.normalize();
  }

  toString(): string {
    const expr: string = this.coefficients
      .map((value: number, index: number): string => `(${value})x^${index}`)
      .reverse()
      .join(" + ");
    return `P[${expr}]`;
  }

  private normalize(): this {
    let i: number = this.coefficients.length;
    while (i > 0 && this.coefficients[i - 1] === 0) {
      i--;
    }
    this.coefficients.length = i;
    return this;
  }
}
