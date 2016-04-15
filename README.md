# Via build-tools #

Build tools for projects using:

 - Typescript
 - Typings
 - SystemJS (JSPM)
 - Mocha

 - Jade (soon)
 - Compass (soon)

## Tasks ##

This packages contains some simple gulp tasks:

````
install
install.npm
install.typings
install.jspm
build
build.browser
build.browser.systemjs
build.browser.tsc
build.node
build.node.tsc
build.node-test
build.node-test.tsc
test
test.node
project.bump
project.lint
````

## Project structure ##

````text
.
├── build/
├── dist/
├── coverage/
├── src/
|   ├── dir1/
|   |   ├── mod1a.ts
|   |   └── mod1b.ts
|   ├── dir2/
|   |   ├── mod2a.ts
|   |   └── mod2b.ts
|   ├── platform/
|   |   ├── browser/
|   |   └── node/
|   └── main.ts
├── README.md
├── package.json
├── gulpfile.js
├── typings.json
└── systemjs.config.js
````
