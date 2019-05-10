# Turbo Gulp Usage

[Jump to the main tasks](#main-tasks)

Turbo Gulp is a package providing fully-packaged [Gulp](https://gulpjs.com/) tasks to develop
Typescript libraries. Its main goal is to avoid configuration duplication across projects, this way
it is easier to keep them up-to-date.

This article is intended to contributors of libraries using Turbo Gulp. It describes the main
commands, not how to configure them.

## Gulp

[Gulp](https://gulpjs.com/) is a task runner for Node. The npm scripts defined in `package.json`
have access to these tasks, but if you want to call them yourself you need to install
[gulp-cli](https://www.npmjs.com/package/gulp-cli) globally on your system:

```
npm install --global gulp-cli
```

**⚠ Make sure to install `gulp-cli`, not `gulp`**.

You can lists the available tasks using at the root of the package (next to `package.json`):

```
gulp --tasks
```

To call a task, pass the task name as an argument to `gulp`. For example, to run the task
`lib:build`, use:

```
gulp lib:build
```

## Tasks and targets

A task is an action to apply to the whole project or to a specific "target".
Targets can be thought as different variants of the project. A typical library
has the following targets: `lib`, `test` and optionally `main` or `example`.

The `lib` target is the most important one. It corresponds to the library code
that is published to _npm_ and consumed by other packages. Its code is also
part of all the other targets. Its source code is located in `src/lib`.
[Documentation](https://demurgos.github.io/turbo-gulp/modules/targets_lib.html).

The `test` target is used to _test_ the library (no surprises here). The tests
use [mocha](https://github.com/mochajs/mocha/) as the test framework and
[c88](https://github.com/demurgos/c88) for code coverage.
The tests use the lib source code (`src/lib`) and test sources in `src/test`.
The files defining the test suites use the `.spec.ts` extension.
[Documentation](https://demurgos.github.io/turbo-gulp/modules/targets_mocha.html).

Some libraries include a `main` or `example` target. It allows to build an executable Node
application using the lib and content from `src/main` or `src/example`.
[Documentation](https://demurgos.github.io/turbo-gulp/modules/targets_node.html).

The corresponding tasks are prefixed by the target name followed by a colon `:`. For example,
all the tasks related to the `test` target start with `test:`. For example: `test:build`,
`test:run`, etc.

Project-wide tasks are not prefixed. For example `lint` or `format`.

## Project structure

Here is the typical layout of a Typescript library using turbo-gulp:

```text
.
├── build/          # Development builds
├── dist/           # Files ready to be distributed
| └── lib/          # This is what goes to npm
├── docs/           # Custom documentation for the library
├── tools/          # Extra scripts to manage the project (usually related to CI/CD)
├── src/            # Scripts, assets and tests
| ├── lib/          # Library source code
| ├── test/         # Test source code (mocha spec files)
| └── main/         # Optional directory, to build Node applications
├── CHANGELOG.md    # Description of the changes for each version
├── CONTRIBUTING.md # How to build and work on the project
├── LICENSE.md      # License file
├── README.md       # Projects presentation
├── package.json    # Project's metadata
├── tsconfig.ts     # Default Typescript config file
└── gulpfile.ts     # Defines the Gulp tasks
```

Additional configuration may be generated (`tsconfig.json`, `tslint.json`). Their purpose is to help
your editor, they are purely informational and do not affect the builds.

## Main tasks

### `gulp lib:build`

- Alias: `npm run build`

Development build, from `src/lib` to `build/lib`.

### `gulp lib:watch`

- Alias: `npm run watch`

Watch files and rebuild on change, from `src/lib` to `build/lib`.

### `gulp test`

- Alias: `npm run test`

Build the test target, run the tests and generate a coverage report.
It compiles the files from `src/lib` and `src/test` to `build/test`.
The files ending in `.spec.ts` are Mocha test-suite definitions.
The coverage report is written to `coverage/`. It contains an HTML (`index.html`)
report for users and an LCOV report (`lcov.info`) for Codecov and similar services.

### `gulp lint`

- Alias: `npm run lint`

Check for common errors and enforce a common style.
This task does not modify the files. See [`gulp-format`](#gulp-format) to fix the errors.

### `gulp format`

- Alias: `npm run format`

Attempt to fix the errors detected by `npm run lint`. Not all errors can be fixed
automatically, but it helps. It overwrites the files in `src/`.

### `gulp lib:typedoc`

- Alias: `npm run typedoc`

Generate documentation from `src/lib` to the `typedoc` directory. During deployment, this
directory is published online (with `gulp lib:deploy:typedoc`).

### `gulp lib:dist`

- Alias: `npm run dist`

Compiles a distribution of the library, from `src/lib` to `dist/lib`. The `dist/lib` directory
contains the files that will be uploaded to npm.
This directory contains the strict minimum to consume the files: `package.json`, the `.js` files,
a `_src` directory with the source files (for source-map support) a the markdown files from
the project root (readme, license, changelog).
The `.js` are written such that `src/lib` corresponds to the root of the package. This enables
deep imports: the file `src/lib/foo/bar.ts` can be imported with `"my-package/foo/bar"`.

### `gulp lib:publish`

Compile a distribution build and publish it to `npm`.
