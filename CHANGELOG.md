## Planned

- Review the organization of the build targets
- Use `displayName` on task functions, instead of separate `generateTaskName` functions.

## Next

- **[Breaking]** Enforce trailing commas by default for multiline objects
- **[Patch]** Allow mergeable namespaces

# 0.13.1

- **[Patch]** Allow namespaces in the default TS-Lint config

# 0.13.0

- **[Breaking]** Major overhaul of the angular target. The server build no longer depends on the client.
- **[Breaking]** Update to `gulp@4` (from `gulp@3`)
- **[Breaking]** Update to `tslint@7` (from `tslint@6`), add stricter default rules
- **[Breaking]** Update signature of targetGenerators and project tasks: it only uses
  `ProjectOptions` and `Target` now, the additional options are embedded in those two objects.
- **[Breaking]** Remove `:install`, `:instal:npm` and `:install:typings`. Use the `prepare` script in
  your `package.json` file instead.
- Add `:tslint.json` project task to generate configuration for `tslint`
- Add first class support for processing of `pug` and `sass` files, similar to `copy`
- Implement end-to-end tests
- Enable `emitDecoratorMetadata` in default typescript options.
- Allow configuration of `:lint` with the `tslintOptions` property of the project configuration.
- Add `<target>:watch` tasks for incremental builds.

# 0.12.3

- Support `templateUrl` and `styleUrls` in angular modules.

# 0.12.2

- Add `<target>:build:copy` task. It copies user-defined files.

# 0.12.1

- Fix `<target>:watch` task.

# 0.12.0

- **[Breaking]**: Change naming convention for tasks. The names primary part is
  the target, then the action (`lib:build` instead of `build:lib`) to group
  the tasks per target.
- **[Breaking]**: Use `typeRoots` instead of `definitions` in configuration to
  specify Typescript definition files.
- Generate `tsconfig.json` file (mainly for editors)
- Implement the `test` target to run unit-tests with `mocha`.

# 0.11.2

- Target `angular`: Add `build:<target>:assets:sass` for `.scss` files (Sassy CSS)

# 0.11.1

- Rename project to `web-build-tools` (`demurgos-web-build-tools` on _npm_)
- Target `angular`: Add `build:<target>:assets`, `build:<target>:pug` and `build:<target>:static`.
- Update `gulp-typescript`: solve error message during compilation
- Targets `node` and `angular`: `build:<target>:scripts` now include in-lined source maps
- Target `node`: `watch:<target>` to support incremental builds
