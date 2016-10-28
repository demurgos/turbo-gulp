# Web build tools

[![npm](https://img.shields.io/npm/v/demurgos-web-build-tools.svg?maxAge=2592000)](https://www.npmjs.com/package/demurgos-web-build-tools)
[![Build status](https://img.shields.io/travis/demurgos/web-build-tools/master.svg?maxAge=2592000)](https://travis-ci.org/demurgos/web-build-tools)

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

## Standard project layout

```text
.
├── build/          # Development builds
├── dist/           # Distributed files (this goes to npm)
├── docs/           # Advanced documentation for the library
├── src/            # Scripts, assets and tests
├── CHANGELOG.md    # Describe all changes
├── CONTRIBUTING.md # How to build and work on the project
├── LICENSE.md      # Generally MIT
├── NOTICE.md       # To match requirements of third-party tools
├── README.md       # Projects presentation
├── package.json    # Project's metadata
├── gulpfile.js     # Definition of Gulp tasks
└── typings.json    # Type declarations settings
```

## Project configuration

**TODO**

## Tasks

### Project

```typescript
import gulp = require("gulp");
import * as buildTools from "via-build-tools";

buildTools.projectTasks.registerAll(
  gulp,
  {
    project: projectOptions,
    tslintOptions: {},
    install: {}
  }
);
```

#### `project:bump:major`

Increments the major version of the project and creates a git commit.

#### `project:bump:major`

Increments the minor version of the project and creates a git commit.

#### `project:bump:major`

Increments the patch version of the project and creates a git commit.

#### `project:lint`

Check the Typescript files.

### Target `node`

**TODO**

### Target `angular`

**TODO**
