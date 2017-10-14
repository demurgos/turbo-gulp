# Web build tools

[![npm](https://img.shields.io/npm/v/demurgos-web-build-tools.svg?maxAge=2592000)](https://www.npmjs.com/package/demurgos-web-build-tools)
[![Build status](https://img.shields.io/travis/demurgos/web-build-tools/master.svg?maxAge=2592000)](https://travis-ci.org/demurgos/web-build-tools)
[![GitHub repository](https://img.shields.io/badge/Github-demurgos%2Fweb--build--tools-blue.svg)](https://github.com/demurgos/web-build-tools)

Gulp tasks generator for Node projects to help with builds, tests and distribution.

This project started out because I wanted to avoid repeating complex configurations in every one of my projects.
I solved it by centralizing most of logic for the tasks I need in this package. To further reduce the overhead of the
configuration, the defaults use a sensible directory structure for Node projects.

The main features are:
- Support for multiple targets in a single project (for example `lib` and `demo`)
- Typescript builds, with support for custom typings, watch mode and custom compiler options
- Tslint verification with type information
- Mocha unit tests
- Typedoc generation
- Assets management: copy resources, build Pug templates, build Sass stylesheets

## Quick start

Install the library as a dev-dependency:

```shell
npm install -D demurgos-web-build-tools
```

Then use it in your Gulp file, here is an example:

```typescript
// Import the build tools and the gulp instance for this project
import * as buildTools from "demurgos-web-build-tools";
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
  customTypingsDir: "src/custom-typings",
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

- Type:
  ```typescript
  interface TslintOptions {
    /**
     * Path to the output tslint.json file, relative to `root`
     */
    tslintJson?: string;
  
    /**
     * Extend the default configuration (merge them).
     * This can either be path relative to `root` or a raw config object (content of tslint.json).
     * If you pass a raw config object, its configFileDir will be `root`.
     */
    configuration?: TslintConfiguration.RawConfigFile | string,
  
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
  ```

This allows you to configure the lint rules.

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
