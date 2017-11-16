import {Configuration as TslintConfiguration } from "tslint";

export interface TslintOptions {
  /**
   * Path to the output tslint.json file, relative to `root`
   */
  tslintJson?: string;

  /**
   * Extend the default configuration
   * This can either be path relative to `root` or a raw config object.
   * If you pass a raw config object, its configFileDir will be `root`.
   */
  configuration?: TslintConfiguration.RawConfigFile | string;

  formatter?: "msbuild" | "verbose" | string;

  /**
   * The files to lint, relative to `root`
   */
  files?: string[];

  /**
   * Instance of tslint to use
   */
  tslint?: any;
}

export const DEFAULT_UNTYPED_TSLINT_RULES: TslintConfiguration.RawRulesConfig = {
  // Enforces function overloads to be consecutive.
  "adjacent-overload-signatures": true,
  // Enforces vertical alignment
  "align": false,
  // Requires using either ‘T[]’ or ‘Array' for arrays
  "array-type": [true, "array"],
  // Requires parentheses around the parameters of arrow function definitions
  "arrow-parens": [
    true,
    // Arrow functions with one parameter must not have parentheses if removing them is allowed by TypeScript.
    "ban-single-arg-parens",
  ],
  // Suggests to convert `() => { return x; }` to `() => x`.
  "arrow-return-shorthand": true,
  // Bans the use of specific functions or global methods
  "ban": [
    true,
  ],
  // Bans specific types from being used.
  "ban-types": false,
  // In a binary expression, a literal should always be on the right-hand side if possible.
  "binary-expression-operand-order": false,
  // An interface or literal type with just a call signature can be written as a function type.
  "callable-types": true,
  // Enforces PascalCased class and interface names
  "class-name": true,
  // Enforces formatting rules for single-line comments
  "comment-format": [
    true,
    // Requires that all single-line comments must begin with a space, as in `// comment`
    "check-space",
    // Requires that the first non-whitespace character of a comment must be uppercase, if applicable.
    // "check-uppercase",
  ],
  // Enforces a threshold of cyclomatic complexity
  "cyclomatic-complexity": [true, 30],
  // Enforces braces for `if`/`for`/`do`/`while` statements
  "curly": true,
  // Ensures the file ends with a newline
  "eofline": true,
  // Enforces UTF-8 file encoding.
  "encoding": true,
  // Enforces a certain header comment for all files, matched by a regular expression
  "file-header": false,
  // Requires a `for ... in` statement to be filtered with an `if` statement
  "forin": false,
  // Disallows importing the specified modules directly via `import` and `require`.
  "import-blacklist": false,
  // Ensures proper spacing between import statement keywords.
  "import-spacing": true,
  // Enforces indentation with tabs or spaces
  "indent": [true, "spaces"],
  // Requires interface names to begin with a capital ‘I’
  "interface-name": [
    true,
    // requires interface names to not have an “I” prefix
    "never-prefix",
  ],
  // Prefer an interface declaration over a type literal (`type T = { ... }`)
  "interface-over-type-literal": true,
  // Enforces basic format rules for JSDoc comments
  "jsdoc-format": true,
  // Only allows labels in sensible locations
  "label-position": true,
  // Enforces a consistent linebreak style
  "linebreak-style": [true, "LF"],
  // A file may not contain more than the specified number of classes
  "max-classes-per-file": [true, 5],
  // Requires files to remain under a certain number of lines
  "max-file-line-count": [true, 800],
  // Requires lines to be under a certain max length
  "max-line-length": [true, 120],
  // Requires explicit visibility declarations for class members
  "member-access": false,
  // Enforces member ordering
  "member-ordering": [
    true,
    {
      order: "fields-first",
    },
  ],
  // Enforces blank line before return when not the only line in the block.
  "newline-before-return": false,
  // Requires parentheses when invoking a constructor via the `new` keyword.
  "new-parens": false,
  // Requires the use of `as Type` for type assertions instead of `<Type>`.
  "no-angle-bracket-type-assertion": false,
  // Diallows usages of `any` as a type declaration.
  "no-any": false,
  // Disallows access to arguments.callee.
  "no-arg": true,
  // Disallows bitwise operators.
  "no-bitwise": false,
  // Disallows any type of assignment in conditionals.
  "no-conditional-assignment": true,
  // Disallows one or more blank lines in a row.
  "no-consecutive-blank-lines": [true, 1],
  // Bans the use of specified console methods.
  "no-console": false,
  // Disallows access to the constructors of `String`, `Number`, and `Boolean`.
  "no-construct": true,
  // Disallows `debugger` statements.
  "no-debugger": true,
  // Disallows default exports in ES6-style modules.
  "no-default-export": true,
  // Disallows multiple import statements from the same module.
  "no-duplicate-imports": false,
  // Warns if `super()` appears twice in a constructor.
  "no-duplicate-super": true,
  // Prevents duplicate cases in switch statements.
  "no-duplicate-switch-case": true,
  // Disallows duplicate variable declarations in the same block scope.
  "no-duplicate-variable": true,
  // Disallows empty blocks.
  "no-empty": false,
  // Forbids empty interfaces.
  "no-empty-interface": false,
  // Disallows `eval` function invocations.
  "no-eval": true,
  // Disallows importing modules that are not listed as dependency in the project’s package.json
  "no-implicit-dependencies": [true, "dev", "optional"],
  // Avoid import statements with side-effect.
  "no-import-side-effect": false,
  // Disallows explicit type declarations for variables or parameters initialized to a number,
  // string, or boolean.
  "no-inferrable-types": false,
  // Disallows internal `module`.
  "no-internal-module": true,
  // Warns on use of `${` in non-template strings.
  "no-invalid-template-strings": true,
  // Disallows using the `this` keyword outside of classes.
  "no-invalid-this": false,
  // Disallows irregular whitespace outside of strings and comments
  "no-irregular-whitespace": true,
  // Disallows the use constant number values outside of variable assignments.
  "no-magic-numbers": false,
  // Disallows mergeable namespaces in the same file.
  "no-mergeable-namespace": false,
  // Disallows use of internal `module`s and `namespace`s.
  "no-namespace": false,
  // Warns on apparent attempts to define constructors for interfaces or `new` for classes.
  "no-misused-new": true,
  // Disallows non-null assertions.
  "no-non-null-assertion": false,
  // Disallows use of the `null` keyword literal.
  "no-null-keyword": false,
  // Forbids an object literal to appear in a type assertion expression. Casting to `any` is still allowed.
  "no-object-literal-type-assertion": false,
  // Disallows parameter properties in class constructors.
  "no-parameter-properties": true,
  // Disallows reassigning parameters.
  "no-parameter-reassignment": false,
  // Disallows `/// <reference path=>` imports (use ES6-style imports instead).
  "no-reference": true,
  // Disallows invocation of `require()`.
  "no-require-imports": true,
  // Disallows unnecessary `return await`.
  "no-return-await": true,
  // Disallows shadowing variable declarations.
  "no-shadowed-variable": false,
  // Forbids array literals to contain missing elements.
  "no-sparse-arrays": true,
  // Disallows object access via string literals.
  "no-string-literal": false,
  // Flags throwing plain strings or concatenations of strings.
  "no-string-throw": true,
  // Disallows importing any submodule.
  "no-submodule-imports": true,
  // Disallows falling through case statements.
  "no-switch-case-fall-through": true,
  // Disallows unnecessary references to `this`.
  "no-this-assignment": [true, {"allow-destructuring": true}],
  // Disallows trailing whitespace at the end of a line.
  "no-trailing-whitespace": true,
  // Replaces `x => f(x)` with just `f`.
  "no-unnecessary-callback-wrapper": true,
  // Forbids a ‘var’/’let’ statement or destructuring initializer to be initialized to ‘undefined’.
  "no-unnecessary-initializer": false,
  // Disallows control flow statements, such as return, continue, break and throws in finally
  // blocks.
  "no-unsafe-finally": true,
  // Disallows unused expression statements.
  "no-unused-expression": true,
  // Disallows usage of the `var` keyword.
  "no-var-keyword": true,
  // Disallows the use of require statements except in import statements.
  "no-var-requires": true,
  // Checks that decimal literals should begin with `0.` instead of just `.`, and should not end with a trailing `0`.
  // TODO: Enable it when the option to enforce lowercase hex is available
  "number-literal-format": false,
  // Enforces consistent object literal property quote style.
  "object-literal-key-quotes": [true, "consistent-as-needed"],
  // Enforces use of ES6 object literal shorthand when possible.
  "object-literal-shorthand": true,
  // Requires keys in object literals to be sorted alphabetically.
  "object-literal-sort-keys": false,
  // Requires the specified tokens to be on the same line as the expression preceding them.
  "one-line": [
    true,
    // Checks that `catch` is on the same line as the closing brace for `try`.
    "check-catch",
    // Checks that `finally` is on the same line as the closing brace for `catch`.
    "check-finally",
    // Checks that `else` is on the same line as the closing brace for `if`.
    "check-else",
    // Checks that an open brace falls on the same line as its preceding expression.
    "check-open-brace",
    // Checks preceding whitespace for the specified tokens.
    "check-whitespace",
  ],
  // Disallows multiple variable definitions in the same declaration statement.
  "one-variable-per-declaration": [true, "ignore-for-loop"],
  // Disallows traditional (non-arrow) function expressions.
  "only-arrow-functions": false,
  // Requires that import statements be alphabetized.
  "ordered-imports": true,
  // Recommends to use a conditional expression instead of assigning to the same thing in each branch of an if
  // statement.
  "prefer-conditional-expression": false,
  // Requires that variable declarations use const instead of let if possible.
  "prefer-const": true,
  // Recommends a ‘for-of’ loop over a standard ‘for’ loop if the index is only used to access
  // the array being iterated.
  "prefer-for-of": true,
  // Warns for class methods that do not use `this`.
  "prefer-function-over-method": false,
  // Prefer `foo(): void` over `foo: () => void` in interfaces and types.
  "prefer-method-signature": true,
  // Enforces the use of the ES2015 object spread operator over `Object.assign()` where appropriate.
  "prefer-object-spread": true,
  // Prefer a `switch` statement to an `if` statement with simple `===` comparisons.
  "prefer-switch": true,
  // Prefer a template expression over string literal concatenation.
  "prefer-template": [true, "allow-single-concat"],
  // Requires single or double quotes for string literals.
  "quotemark": [
    true,
    // Enforces double quotes.
    "double",
    // Forbids single-line untagged template strings that do not contain string interpolations.
    "avoid-template",
    // Allows you to use the “other” quotemark in cases where escaping would normally be required.
    "avoid-escape",
  ],
  // Requires the radix parameter to be specified when calling `parseInt`.
  "radix": true,
  // Enforces consistent semicolon usage at the end of every statement.
  "semicolon": [true, "always"],
  // Require or disallow a space before function parenthesis
  "space-before-function-paren": [
    true,
    {
      anonymous: "always",
      named: "never",
      asyncArrow: "always",
      method: "never",
      constructor: "never",
    },
  ],
  // Enforces spaces within parentheses or disallow them.
  "space-within-parens": [true, 0],
  // Requires a `default` case in all `switch` statements.
  "switch-default": true,
  // Checks whether the final clause of a switch statement ends in `break;`.
  "switch-final-break": [true, "always"],
  // Requires or disallows trailing commas in array and object literals, destructuring
  // assignments, function and tuple typings, named imports and function parameters.
  "trailing-comma": [
    true,
    {
      // Checks multi-line object literals.
      multiline: "always",
      // Checks single-line object literals.
      singleline: "never",
    },
  ],
  // Requires `===` and `!==` in place of `==` and `!=`.
  "triple-equals": true,
  // Checks that type literal members are separated by semicolons. Enforces a trailing semicolon for multiline type
  // literals.
  "type-literal-delimiter": true,
  // Requires type definitions to exist.
  "typedef": [
    true,
    // Check return types of interface properties.
    "property-declaration",
    // Check variable declarations.
    "variable-declaration",
    // Check member variable declarations.
    "member-variable-declaration",
  ],
  // Requires or disallows whitespace for type definitions.
  "typedef-whitespace": [
    true,
    // Specifies how much space should be to the _left_ of a typedef colon.
    {
      "call-signature": "nospace",
      "index-signature": "nospace",
      "parameter": "nospace",
      "property-declaration": "nospace",
      "variable-declaration": "nospace",
    },
    // Specifies how much space should be to the _right_ of a typedef colon.
    {
      "call-signature": "onespace",
      "index-signature": "onespace",
      "parameter": "onespace",
      "property-declaration": "onespace",
      "variable-declaration": "onespace",
    },
  ],
  // Makes sure result of `typeof` is compared to correct string values.
  "typeof-compare": true,
  // Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter.
  "unified-signatures": true,
  // Enforces use of the `isNaN()` function to check for NaN references instead of a comparison
  // to the `NaN` constant.
  "use-isnan": true,
  // Checks variable names for various errors.
  "variable-name": [true, "check-format", "allow-leading-underscore"],
  // Enforces whitespace style conventions.
  "whitespace": [
    true,
    // Checks branching statements (`if`/`else`/f`or`/`while`) are followed by whitespace.
    "check-branch",
    // Checks that variable declarations have whitespace around the equals token.
    "check-decl",
    // Checks for whitespace around operator tokens.
    "check-operator",
    // Checks for whitespace in import & export statements.
    "check-module",
    // Checks for whitespace after separator tokens (`,`/`;`).
    "check-separator",
    // Checks that there is no whitespace after rest/spread operator (`...`).
    "check-rest-spread",
    // Checks for whitespace before a variable type specification.
    "check-type",
    // Checks for whitespace between a typecast and its target.
    "check-typecast",
    // Checks for whitespace between type operators `|` and `&`.
    "check-type-operator",
    // Checks for whitespace before the opening brace of a block.
    "check-preblock",
  ],
};

export const DEFAULT_TYPED_TSLINT_RULES: TslintConfiguration.RawRulesConfig = {
  ...DEFAULT_UNTYPED_TSLINT_RULES,
  // Warns for an awaited value that is not a Promise.
  "await-promise": true,
  // Enforces documentation for important items be filled out.
  "completed-docs": [true, ["classes", "functions"]],
  // Warns when deprecated APIs are used.
  "deprecation": true,
  // Requires that a default import have the same name as the declaration it imports. Does nothing for anonymous
  // default exports.
  "match-default-export-name": false,
  // Warns on comparison to a boolean literal, as in `x === true`.
  "no-boolean-literal-compare": true,
  // Promises returned by functions must be handled appropriately.
  "no-floating-promises": true,
  // Disallows iterating over an array with a for-in loop.
  "no-for-in-array": true,
  // Disallow type inference of `{}` (empty object type) at function and constructor call sites.
  "no-inferred-empty-object-type": false,
  // Warns when a method is used as outside of a method call.
  "no-unbound-method": false,
  // Warns when using an expression of type `any` in a dynamic way.
  "no-unsafe-any": false,
  // Warns when a namespace qualifier (`A.x`) is unnecessary.
  "no-unnecessary-qualifier": true,
  // Warns if a type assertion does not change the type of an expression.
  "no-unnecessary-type-assertion": false,
  // Disallows unused imports, variables, functions and private class members.
  "no-unused-variable": false,
  // Disallows usage of variables before their declaration.
  "no-use-before-declare": true,
  // Requires expressions of type void to appear in statement position.
  "no-void-expression": true,
  // Requires any function or method that returns a promise to be marked async.
  "promise-function-async": true,
  // When adding two variables, operands must both be of type number or of type string.
  "restrict-plus-operands": true,
  // Prefer `return;` in void functions and `return undefined;` in value-returning functions.
  "return-undefined": true,
  // Usage of && or || operators should be with boolean operands and expressions in If, Do, While and For statements
  // should be of type boolean.
  "strict-boolean-expressions": true,
  // Warns for type predicates that are always true or always false.
  "strict-type-predicates": false,
  // Warns if an explicitly specified type argument is the default for that type parameter.
  "use-default-type-parameter": false,
};

export const DEFAULT_UNTYPED_TSLINT_CONFIG: TslintConfiguration.RawConfigFile = {
  rules: DEFAULT_UNTYPED_TSLINT_RULES,
};

// TODO: Support type checking
export const DEFAULT_TYPED_TSLINT_CONFIG: TslintConfiguration.RawConfigFile = {
  rules: DEFAULT_TYPED_TSLINT_RULES,
};
