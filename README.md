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
 
 
buildTools.projectTasks.registerAll(gulp, {
  project: projectOptions,
  webpackOptions
});
```
 
To generate a target, use:

```typescript
import * as buildTools from "demurgos-web-build-tools";

// buildTools.targetGenerators.<kind>.generateTarget(gulp, targetName, options);

buildTools.targetGenerators.node.generateTarget(gulp, "server",  {
    project: projectOptions,
    target: nodeTargetOptions,
    // other options...
  }
);

buildTools.targetGenerators.test.generateTarget(gulp, "test",  {
    project: projectOptions,
    target: testTargetOptions,
    // other options...
  }
);

buildTools.targetGenerators.angular.generateTarget(gulp, "angular",  {
    project: projectOptions,
    target: angularTargetOptions,
    // other options...
  }
);

```

## Project configuration

See `src/lib/config/config.ts`.

## Tasks

### Project

```typescript
import gulp = require("gulp");
import * as buildTools from "demurgos-web-build-tools";

buildTools.projectTasks.registerAll(
  gulp,
  {
    project: projectOptions,
    tslintOptions: {},
    install: {}
  }
);
```

#### `:bump:major`

Increments the major version of the project and creates a git commit.

#### `:bump:major`

Increments the minor version of the project and creates a git commit.

#### `:bump:major`

Increments the patch version of the project and creates a git commit.

#### `:lint`

Check the Typescript files.

### Target `node`

Options: see `src/lib/config/config.ts`

#### `<targetName>:build`

Build the target to `buildDir/<targetName>`.

#### `<targetName>:build:scripts`

Compile the Typescript files to `buildDir/<targetName>`.

#### `<targetName>:clean`

Delete the build files in `buildDir` and `distDir` for this target.

#### `<targetName>:copy`

Perform required file copies at the end of the build.

#### `<targetName>:dist`

Clean the files, build the target and then copy it to `distDir` (ready for
publication).

#### `<targetName>:tsconfig`

Generate as `tsconfig.json` file in the base directory for this target so
you can compile it without `gulp` and just `tsc`:

Example for the target `api-server` with the baseDirectory `server`:

```
gulp api-server:tsconfig
cd src/server
tsc
# The target `api-server` is now built
```

#### `<targetName>:watch`

Recompile when the files change.

### Target `angular`

Options: see `src/lib/config/config.ts`

**TODO**

### Target `test`

Options: see `src/lib/config/config.ts`

**TODO**
