# Design notes

## Npm publish for release and dev

### Goal

You should be able to easily publish builds to `npm`. It should be possible to publish to npm automatically
when a commit is merged to master: this is a development publish. Some merges to master might be treated as
releases: they mark a stable version.

A release directly use the data in `package.json` and publishes it with the `latest` tag.

A dev publish appends `-dev.xxx` to the version (where `xxx` is a build number) and publishes it with the
`next` tag.

There are differences in two steps: `lib:dist:package.json` and `lib:dist:deploy`.

In a dev publish, the package.json file in `dist` is tranformed to add `-dev.xxx`, and during the deployment
a different tag is used.

We also want `lib:dist:deploy` to be the only command needed to deploy, it produces the right `dist`.

The library (`demurgos-web-build-tools`) should not read the command line arguments directly.

#### Solution 1

Use different target goals: `lib:dist` and `lib:dist-dev`, leading to `lib:dist:package.json` /
`lib:dist-dev:package.json` and `lib:dist:deploy` / `lib:dist-dev:deploy`.

- Pros:
  - Simple: No need for condition / change of meaning
- Cons:
  - Verbose
  - Unclear how to deal with other tasks required to dist: should they be shared or copied for each goal.
    For example, `lib:dist:copy-src` is the same, should there be a `lib:dist-dev:copy-src`?

#### Solution 2

Let the user change the configuration. He can use a CLI flag but has to deal with it himself.
Once the configuration is done, only one goal is generated and its behavior is set.

- Pros:
  - No need to handle multiple cases in the lib, it's a user issue
- Cons:
  - It's a user issue
  - Only one goal is generated for each invocation of the CLI, you cannot mix dev and release publish in the same
  instance.

### Conclusion

We'll try to use the second solution because it leads to a cleaner API but we'll have to eventually come up with
something to reduce the user burden to deal with the CLI.
