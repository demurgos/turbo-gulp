# Turbo Gulp

Gulp tasks to boost high-quality projects.

[![npm](https://img.shields.io/npm/v/turbo-gulp.svg)](https://www.npmjs.com/package/turbo-gulp)
[![GitHub repository](https://img.shields.io/badge/Github-demurgos%2Fturbo--gulp-blue.svg)](https://github.com/demurgos/turbo-gulp)
[![Build status](https://img.shields.io/travis/com/demurgos/turbo-gulp/master.svg)](https://travis-ci.org/demurgos/turbo-gulp)
[![Codecov](https://codecov.io/gh/demurgos/turbo-gulp/branch/master/graph/badge.svg)](https://codecov.io/gh/demurgos/turbo-gulp)

This package was known as `demurgos-web-build-tools` before `v0.15.2` (2017-11-09).

This project started out because I wanted to avoid repeating complex configurations in every one of my projects.
I solved it by centralizing most of logic for the tasks I need in this package. To further reduce the overhead of the
configuration, the defaults use a sensible directory structure for Node projects.

The main features are:
- Support for multiple targets in a single project (for example `lib` and `example`)
- Typescript builds, with support for custom typings, watch mode and custom compiler options
- Tslint verification with type information
- Mocha unit tests
- Code coverage with `c8`
- Typedoc generation
- Assets management: copy resources

## Installation

Install the library as a dev-dependency:

```shell
npm install -D turbo-gulp
```

Builds of the master branch are also regularly released using the `next` tag:

```shell
npm install -D turbo-gulp@next
```

## Quick start

**TODO**: Add better guide to configure repo and Travis CI, code coverage and codecov integrations.
For the moment, take a look at this reference project: [Incident](https://github.com/demurgos/incident).

Then use it in your Gulp file, here is an example:

```typescript
// Import the build tools and the gulp instance for this project
import * as buildTools from "turbo-gulp";
import * as gulp from "gulp";

// Project config shared by all the targets
const project: buildTools.Project = {
  root: __dirname,
  packageJson: "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src",
};

// Configuration for a "library" target
const lib: buildTools.LibTarget = {
  // Project-wide config
  project,
  // Name (used as a prefix for the tasks)
  name: "lib",
  // Override srcDir
  srcDir: "src/lib",
  scripts: ["**/*.ts"],
  mainModule: "index",
  tscOptions: {
    skipLibCheck: true,
  },
  typedoc: {
    dir: "typedoc",
    name: "Example lib",
  },
  copy: [
    {
      name: "json",
      files: ["**/*.json"],
    },
  ],
  clean: {
    dirs: ["build/lib", "dist/lib"],
  },
};

// Generate and register project-wide tasks
buildTools.projectTasks.registerAll(gulp, project);
// Generate and register the tasks for the lib target
buildTools.registerLibTasks(gulp, lib);
```

You can then start using the tasks, for example `gulp lib:build`. Use `gulp --tasks` to list all the tasks.
Check the documentation for the list of available tasks and configuration.

## Recommended project layout

Here

```text
.
├── build/          # Development builds
├── dist/           # Distributed files (this goes to npm)
├── docs/           # Custom documentation for the library
├── src/            # Scripts, assets and tests
| ├── lib/          # Library source code
| └── test/         # Tests source code
├── CHANGELOG.md    # Description of the changes for each version
├── CONTRIBUTING.md # How to build and work on the project
├── LICENSE.md      # License file
├── NOTICE.md       # Notice for third-party tools (required by some licenses)
├── README.md       # Projects presentation
├── package.json    # Project's metadata
├── tsconfig.ts     # Default TS config file, used for the gulp file and to help the IDE
└── gulpfile.ts     # Definition of Gulp tasks
```

## Usage

The build tools use the following hierarchy:
- **Project**: It represents a unit of code to implement a library or application, it usually corresponds to
  a git repo or a single gulp file. A project is a set of targets (see below). The project configuration is shared by
  all the targets, it defines the general structure of your project: what is the root directory, the build directory,
  the base Typescript options, etc.
- **Target**: A target represents a unit of output. You can have some shared source code and use it to build multiple
  targets: for example, a library importable by other projects, a runnable demo, a test build using Mocha, a bundled
  version for the browser, etc. The target options are specific to each type of output and allow you to configure how
  each task is applied.
- **Task**: A task represents an operation provided by a target: `build`, `run`, `test`, etc. This is what you actually
  use when calling Gulp. The task names have the form `targetName:taskName`. For example to generate the documentation
  of the library target `lib` using Typedoc, you can use `gulp lib:typedoc`. There are main tasks to do high-level
  actions, and other tasks for fine-grained that are mostly available to integrate with other tools.

## License

[MIT License](./LICENSE.md)
