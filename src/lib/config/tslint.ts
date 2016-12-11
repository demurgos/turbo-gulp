// tslint:disable-next-line:typedef
export const tslintConfig = {
  rules: {
    // Enforces function overloads to be consecutive
    "adjacent-overload-signatures": true,
    // Enforces vertical alignment
    "align": true,
    // Requires using either ‘T[]’ or ‘Array' for arrays
    "array-type": [true, "array"],
    // Requires parentheses around the parameters of arrow function definitions
    "arrow-parens": true,
    // Bans the use of specific functions or global methods
    "ban": [
      true
    ],
    // Enforces PascalCased class and interface names
    "class-name": true,
    // Enforces formatting rules for single-line comments
    "comment-format": [
      true,
      // Requires that all single-line comments must begin with a space, as in `// comment`
      "check-space"
    ],
    // Enforces documentation for important items be filled out
    // "completed-docs": [true, ["classes", "functions"]],
    // Enforces a threshold of cyclomatic complexity
    "cyclomatic-complexity": [true, 40],
    // Enforces braces for `if`/`for`/`do`/`while` statements
    "curly": true,
    // Ensures the file ends with a newline
    "eofline": true,
    // Enforces a certain header comment for all files, matched by a regular expression
    "file-header": [false],
    // Requires a `for ... in` statement to be filtered with an `if` statement
    "forin": false,
    // Enforces indentation with tabs or spaces
    "indent": [true, "spaces"],
    // Requires interface names to begin with a capital ‘I’
    "interface-name": false,
    // Enforces basic format rules for JSDoc comments
    "jsdoc-format": true,
    // Only allows labels in sensible locations
    "label-position": true,
    // Enforces a consistent linebreak style
    "linebreak-style": [true, "LF"],
    // A file may not contain more than the specified number of classes
    "max-classes-per-file": [true, 5],
    // Requires files to remain under a certain number of lines
    "max-file-line-count": [true, 1000],
    // Requires lines to be under a certain max length
    "max-line-length": [true, 120],
    // Requires explicit visibility declarations for class members
    "member-access": false,
    // Enforces member ordering
    "member-ordering": {
      order: "fields-first"
    },
    // Requires parentheses when invoking a constructor via the `new` keyword
    "new-parens": false,
    // Requires the use of `as Type` for type assertions instead of `<Type>`
    "no-angle-bracket-type-assertion": true,
    // Diallows usages of any as a type declaration
    "no-any": false,
    // Disallows access to arguments.callee
    "no-arg": true,
    // Disallows bitwise operators
    "no-bitwise": false,
    // Disallows any type of assignment in conditionals
    "no-conditional-assignment": true,
    // Disallows one or more blank lines in a row
    "no-consecutive-blank-lines": [true, 1],
    // Bans the use of specified console methods
    "no-console": [false],
    // Disallows `debugger` statements
    "no-debugger": true,
    // Disallows default exports in ES6-style modules
    "no-default-export": false,
    // Disallows duplicate variable declarations in the same block scope
    "no-duplicate-variable": true,
    // disallow duplicate keys in object literals
    // "no-duplicate-key": true,
    // Disallows empty blocks
    "no-empty": false,
    // Disallows `eval` function invocations
    "no-eval": true,
    // Disallows iterating over an array with a for-in loop
    // "no-for-in-array": true,
    // Disallows explicit type declarations for variables or parameters initialized to a number,
    // string, or boolean
    "no-inferrable-types": false,
    // Disallows internal `module`
    "no-internal-module": true,
    // Disallows using the `this` keyword outside of classes
    "no-invalid-this": true,
    // Disallows mergeable namespaces in the same file
    "no-mergeable-namespace": true,
    // Disallows use of internal `module`s and `namespace`s
    "no-namespace": true,
    // Disallows use of the `null` keyword literal
    "no-null-keyword": false,
    // Disallows parameter properties in class constructors
    "no-parameter-properties": true,
    // Disallows `/// <reference path=>` imports (use ES6-style imports instead)
    "no-reference": true,
    // Disallows invocation of `require()`
    "no-require-imports": false,
    // Disallows shadowing variable declarations
    "no-shadowed-variable": true,
    // Disallows object access via string literals
    "no-string-literal": true,
    // Disallows falling through case statements
    "no-switch-case-fall-through": true,
    // Disallows trailing whitespace at the end of a line
    "no-trailing-whitespace": true,
    // Disallows control flow statements, such as return, continue, break and throws in finally
    // blocks
    "no-unsafe-finally": true,
    // Disallows unused expression statements
    "no-unused-expression": true,
    // Disallows unused ‘new’ expression statements
    "no-unused-new": true,
    // Disallows usage of variables before their declaration
    "no-use-before-declare": true,
    // Disallows usage of the `var` keyword
    "no-var-keyword": true,
    // Disallows the use of require statements except in import statements
    "no-var-requires": true,
    // Enforces consistent object literal property quote style
    "object-literal-key-quotes": [true, "consistent-as-needed"],
    // Enforces use of ES6 object literal shorthand when possible
    "object-literal-shorthand": false,
    // Requires keys in object literals to be sorted alphabetically
    "object-literal-sort-keys": false,
    // Requires the specified tokens to be on the same line as the expression preceding them
    "one-line": [
      true,
      // Checks that `catch` is on the same line as the closing brace for `try`
      "check-catch",
      // Checks that `finally` is on the same line as the closing brace for `catch`
      "check-finally",
      // Checks that `else` is on the same line as the closing brace for `if`
      "check-else",
      // Checks that an open brace falls on the same line as its preceding expression
      "check-open-brace",
      // Checks preceding whitespace for the specified tokens
      "check-whitespace"
    ],
    // Disallows multiple variable definitions in the same declaration statement
    "one-variable-per-declaration": [true, "ignore-for-loop"],
    // Disallows traditional (non-arrow) function expressions
    "only-arrow-functions": false,
    // Requires that import statements be alphabetized
    "ordered-imports": true,
    // Recommends a ‘for-of’ loop over a standard ‘for’ loop if the index is only used to access
    // the array being iterated
    "prefer-for-of": true,
    // Requires single or double quotes for string literals
    "quotemark": [
      true,
      // Enforces double quotes
      "double",
      // Allows you to use the “other” quotemark in cases where escaping would normally be required
      "avoid-escape"
    ],
    // Requires the radix parameter to be specified when calling `parseInt`
    "radix": true,
    // When adding two variables, operands must both be of type number or of type string
    // "restrict-plus-operands": true,
    // Enforces consistent semicolon usage at the end of every statement
    "semicolon": [true, "always"],
    // Requires a `default` case in all `switch` statements
    "switch-default": false,
    // Requires or disallows trailing commas in array and object literals, destructuring
    // assignments, function and tuple typings, named imports and function parameters
    "trailing-comma": [
      true,
      {
        // Checks multi-line object literals
        multiline: "never",
        // Checks single-line object literals
        singleline: "never"
      }
    ],
    // Requires `===` and `!==` in place of `==` and `!=`
    "triple-equals": true,
    // Requires type definitions to exist
    "typedef": [
      true,
      // Check return types of interface properties
      "property-declaration",
      // Check variable declarations
      "variable-declaration",
      // Check member variable declarations
      "member-variable-declaration"
    ],
    // Requires or disallows whitespace for type definitions
    "typedef-whitespace": [
      true,
      // Specifies how much space should be to the _left_ of a typedef colon
      {
        "call-signature": "nospace",
        "index-signature": "nospace",
        "parameter": "nospace",
        "property-declaration": "nospace",
        "variable-declaration": "nospace"
      },
      // Specifies how much space should be to the _right_ of a typedef colon
      {
        "call-signature": "onespace",
        "index-signature": "onespace",
        "parameter": "onespace",
        "property-declaration": "onespace",
        "variable-declaration": "onespace"
      }
    ],
    // Enforces use of the `isNaN()` function to check for NaN references instead of a comparison
    // to the `NaN` constant
    "use-isnan": true,
    // Checks variable names for various errors
    "variable-name": [true, "check-format", "allow-leading-underscore"],
    // Enforces whitespace style conventions
    "whitespace": [
      true,
      // Checks branching statements (`if`/`else`/f`or`/`while`) are followed by whitespace
      "check-branch",
      // Checks that variable declarations have whitespace around the equals token
      "check-decl",
      // Checks for whitespace around operator tokens
      "check-operator",
      // Checks for whitespace in import & export statements
      "check-module",
      // Checks for whitespace after separator tokens (`,`/`;`)
      "check-separator",
      // Checks for whitespace before a variable type specification
      "check-type",
      // Checks for whitespace between a typecast and its target
      "check-typecast"
    ]
  }
};

export default tslintConfig;
