export class Polynomial<T extends number> {
  coefficients: T[];

  constructor(coefficients: T[] = []) {
    this.coefficients = coefficients;
    this.normalize();
  }

  addAssign(rhs: Polynomial<T>): this {
    const nextCoefficients = new Array(Math.max(this.coefficients.length, rhs.coefficients.length));
    for (let i = 0; i < nextCoefficients.length; i++) {
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

  private normalize(): this {
    let i = this.coefficients.length;
    while (i > 0 && this.coefficients[i - 1] === 0) {
      i--;
    }
    this.coefficients.length = i;
    return this;
  }

  toString(): string {
    const expr: string = this.coefficients
      .map((value: T, index: number): string => `(${value})x^${index}`)
      .reverse()
      .join(" + ");
    return `P[${expr}]`;
  }
}
