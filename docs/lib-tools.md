# Lib tools

Hi!

This file details the main commands available for libraries.

## Development

### `gulp build`

Compile the scripts from `src/lib` to `build/lib`.

### `gulp watch`

Watch files for changes and compile automatically.

### `gulp clean`

Remove the `build`, `dist` and `typedoc` directories.

## Tests

### `gulp lint`

Run `tslint` checks, fix simple errors automatically.
It performs static Typescript code checks. 

### `gulp test`

Build `src/{lib|test}` to `build/test` and run the Mocha tests.

## Distribution

Publication to npm is not done done manually but by continuous integration (Travis CI or Gitlab CI).

Create a commit with the message `Release v1.2.4` and send a PR.
The CI will check that the version in the commit message corresponds to the one in the package (as part of the build).
Once the PR is validated and merged to master, CI runs again.
It makes the same checks, but since it's on master it publishes the package to `npm`.

### `gulp dist`

Prepare the package for distribution. The result will be in `dist/lib`: this is what will be published
to npm.
This build contains `ts`, `.d.ts` and `.js` files for the source (from `src/lib`), documentation in `docs`
and `package.json`.

### `gulp link`

Will invoke `yarn link` on distribution build for this library.

### `gulp typedoc`

Generate documentation in the `typedoc` directory.

### `gulp publish`

Build the package for distribution, upload the documentation to `gh-pages` and publish the package
to `npm`.
This will automatically decide if this is a release or dev publication depending if the
current commit is has a semver tag/

### `gulp release`

Bump the version number and tag the release.
This will mark the package to be published to _npm_ by Travis once merged to master.

## Examples

### `gulp demo`

If the library provides a demo (`src/demo`), to build and run it.
