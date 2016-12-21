# Web build tools

[![npm](https://img.shields.io/npm/v/demurgos-web-build-tools.svg?maxAge=2592000)](https://www.npmjs.com/package/demurgos-web-build-tools)
[![Build status](https://img.shields.io/travis/demurgos/web-build-tools/master.svg?maxAge=2592000)](https://travis-ci.org/demurgos/web-build-tools)
[![GitHub repository](https://img.shields.io/badge/Github-demurgos%2Fweb--build--tools-blue.svg)](https://github.com/demurgos/web-build-tools)

Gulp tasks generator for standard web projects.

This package consolidates various tools in a single interface. This is tailored for my personal
needs. By using the same tools with a standard structure, I am able to update my build chain in a
single place (here) and benefit from this in all my main projects.

Here is the list of tools:
- Typescript 2.1
- Typings: Manage type declarations
- Webpack: Bundle resource for the browser
- Mocha: Tests
- Pug: Generate HTML pages from templates
- Sass: Generate CSS from Sass files

## Standard project layout

```text
.
├── build/          # Development builds
├── dist/           # Distributed files (this goes to npm)
├── docs/           # Advanced documentation for the library
├── src/            # Scripts, assets and tests
├── CHANGELOG.md    # Describe all the changes
├── CONTRIBUTING.md # How to build and work on the project
├── LICENSE.md      # Generally MIT
├── NOTICE.md       # To match requirements of third-party tools
├── README.md       # Projects presentation
├── package.json    # Project's metadata
├── gulpfile.js     # Definition of Gulp tasks
└── typings.json    # Type declarations settings
```

## Usage

This library generate gulp tasks for _targets_ in the context of a _project_.
A target is basically a final build, and a project is a set of targets.

There are currently 3 supported targets:
- Node: Generate a Node package, either an executable or a library. It only
  compiles Typescript files.
- Angular: Generate an Angular application, for the server. It compiles
  Typescript files, builds Pug and Sass files and copy assets.
- Test: Build and run the unit-tests with Node. It is mainly to test a `node`
  target.

The project configuration defines were are the `package.json`, `src` directory,
`build` directory, etc.

A target configuration defines the files to compile and the specific options.
  
To generate general tasks (`:lint`, `:bump-minor`, etc.), use:
 
```typescript
import * as buildTools from "demurgos-web-build-tools";
import gulp = require("gulp");

// Project-wide options
const projectOptions = Object.assign(
  {},
  buildTools.config.DEFAULT_PROJECT_OPTIONS,
  {
    root: __dirname
  }
);

buildTools.projectTasks.registerAll(gulp, projectOptions);
```
 
To generate a target, use:

```typescript
import * as buildTools from "demurgos-web-build-tools";
import gulp = require("gulp");

// Project-wide options
const projectOptions = buildTools.config.DEFAULT_PROJECT_OPTIONS;

// Preconfigured targets
// Node library
const libTarget = buildTools.config.LIB_TARGET;
// Mocha tests
const libTestTarget = buildTools.config.LIB_TEST_TARGET;
// Webpack build for angular config
const angularClientTarget = buildTools.config.ANGULAR_CLIENT_TARGET;

// buildTools.targetGenerators.<kind>.generateTarget(gulp, project, target);
buildTools.targetGenerators.node.generateTarget(gulp, projectOptions, libTarget);
buildTools.targetGenerators.test.generateTarget(gulp, projectOptions, libTestTarget);
buildTools.targetGenerators.webpack.generateTarget(gulp, projectOptions, angularClientTarget);
```

## Project

### Project Options

#### `root`

- Type: `string`

Path to the root of your project.
**This is the only path allowed to be absolute**.

### `packageJson`

- Type: `string`

Relative path from `project.root` to your **package.json** file.

### `packageJson`

- Type: `string`

Relative path from `project.root` to your **package.json** file.

### `srcDir`

- Type: `string`

Relative path from `project.root` to the directory containing the sources of your project.

### `buildDir`

- Type: `string`

Relative path from `project.root` to the directory where the output of the builds should be placed.

This directory is usually ignored by your version control system.

### `distDir`

- Type: `string`

Relative path from `project.root` to the directory containing the builds you wish to publish
or export (distribute).

### `tslint`

**TODO**: The configuration of tslint will be updated. It currently uses `tslintJson` and `tslintOptions`.

### Project Tasks

#### `:bump-major`

1. Increments the major version of the project
2. Creates a _git_ commit `Release <version>`. (example: `Release 2.2.1`)
3. Creates a _git_ tag `v<version>` with the message `Release <version>`.
   (Example: name: `v2.2.1`, message: `Release 2.2.1`)

#### `:bump-minor`

Same as `:bump-major` but increments the minor version.

#### `:bump-patch`

Same as `:bump-major` but increments the patch version.

#### `:lint`

Check the Typescript files with [TSLint][github-tslint].
See `src/lib/config/tslint.ts` for the default configuration.

## _node_ target

### Options for a _node_ target

#### `name`

- Type: `string`

Name of the target. This is used as the prefix for each task.
For example, `"name": "foo"` leads to `gulp foo:build`.

#### `targetDir`

- Type: `string`
- Default: `target.name`

Relative path from `project.buildDir` to the directory containing the output of this target.
This is usually a subdirectory of `project.buildDir`.

#### `scripts`

- Type: `string[]`

Relative patterns from `project.srcDir` to match the `*.ts` files to compile for this target.

#### `typeRoots`

- Type: `string[]`

Relative paths from `project.srcDir` to the directories containing ths `*.d.ts` type definition files
of third-party libraries.

#### `typescript`

- Type: `TypescriptOptions`
- Optional

Advanced Typescript options. See `src/lib/config/config.ts`.

#### `copy`

- Type: `CopyOptions[]`
- Optional

Copy some files during the build process.

#### `pug`

- Type: `PugOptions[]`
- Optional

Render some HTML files from Pug templates during the build process.

#### `sass`

- Type: `SassOptions[]`
- Optional

Render some CSS files from `*.scss` files during the build process.

### `mainModule`

- Type: `string`

Relative module id (path without the extension) from `target.srcDir` of the main module.

This is usually the file to start when running the project or the entry point of the library.

### Tasks for a _node_ target

#### `<targetName>:build`

Build the complete target and output its result to `target.targetDir`.

#### `<targetName>:build:scripts`

Compile the Typescript files.

#### `<targetName>:build:copy`

Perform simple copies.

#### `<targetName>:build:pug`

Compile Pug templates.

#### `<targetName>:build:sass`

Compile `*.scss` files.

#### `<targetName>:clean`

Delete the files of this target in `project.buildDir` and `project.distDir`.

#### `<targetName>:dist`

Clean the files, build the target and then copy it to `distDir` (ready for
publication).

#### `<targetName>:tsconfig.json`

Generate as `tsconfig.json` file in the base directory for this target so
you can compile it without `gulp` and just `tsc`:

Example for the target `api-server` with the baseDirectory `server`:

```
gulp api-server:tsconfig.json
cd src/server
tsc
# The target `api-server` is now built
```

#### `<targetName>:watch`

Recompile when the files change.

### Target `webpack`

Options: see `src/lib/config/config.ts`

**TODO**

### Target `test`

Options: see `src/lib/config/config.ts`

**TODO**


[github-tslint]: https://github.com/palantir/tslint
