// TODO: use interface
export const tslintConfig = {
  rules: {
    "comment-format": [
      true,
      // single-line comments must begin with a space
      "check-space"
    ],
    // enforce braces for `if`/`for`/`do`/`while` statements
    "curly": true,
    // enforce the file to end with a newline
    "eofline": true,
    // enforce indentation with tabs or spaces
    "indent": "spaces",
    // set the maximum length of a line
    "max-line-length": 120,
    "member-ordering": [
      true,
      // public members must be declared before private members
      "public-before-private",
      // static members must be declared before instance members
      "static-before-instance",
      // variables need to be declared before functions
      "variables-before-functions"
    ],
    // allow usages of `any` as a type decoration.
    "no-any": false,
    // disallow access to arguments.callee
    "no-arg": true,
    // allow bitwise operators
    "no-bitwise": false,
    // disallow assignments in conditionals, this applies to `do-while`, `for`,
    // `if`, and `while` statements
    "no-conditional-assignment": true,
    // disallow having more than one blank line in a row in a file.
    "no-consecutive-blank-lines": true,
    // disallow `debugger` statements
    "no-debugger": true,
    // disallow duplicate keys in object literals
    "no-duplicate-key": true,
    "no-empty": false,
    "no-eval": true,
    // "no-internal-module": true,
    // allow use of the null keyword literal
    "no-null-keyword": false,
    // disallow invocation of require()
    "no-require-imports": false,
    // disallow object access via string literals
    // "no-string-literal": true,
    // disallow falling through case statements
    "no-switch-case-fall-through": true,
    // disallow trailing whitespace at the end of a line
    "no-trailing-whitespace": true,
    // disallow unreachable code after `break`, `catch`, `throw`, and `return`
    // statements
    "no-unreachable": true,
    // disallow usage of variables before their declaration
    "no-use-before-declare": true,
    // disallow usage of the `var` keyword, use `let` or `const` instead
    "no-var-keyword": true,
    // "object-literal-sort-keys": true,
    "one-line": [
      true,
      // check that `catch` is on the same line as the closing brace for `try`
      "check-catch",
      // check that `else` is on the same line as the closing brace for `if`
      "check-else",
      // check that an open brace falls on the same line as its preceding
      // expression
      "check-open-brace"
      // "check-whitespace"
    ],
    "quotemark": [
      true,
      // enforce double quotes
      "double",
      // allow to use single quotes to avoid escaping double quotes
      "avoid-escape"
    ],
    // enforce the radix parameter of parseInt
    "radix": true,
    // enforce semicolons at the end of every statement
    "semicolon": true,
    // enforce === and !== in favor of == and !=
    "triple-equals": true,
    "whitespace": [
      true,
      "check-branch",
      "check-decl",
      // "check-operator",
      "check-module",
      "check-separator",
      "check-type",
      "check-typecast"
    ]
  }
};

export default tslintConfig;
