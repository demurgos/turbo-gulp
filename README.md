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
|   ├── lib/
|   |   ├── ...
|   |   └── index.ts
|   ├── test/
|   |   └── ...
|   └── main/
|       ├── ...
|       └── main.ts
├── LICENSE.md
├── NOTICE.md
├── README.md
├── package.json
├── gulpfile.js
└── typings.json
````
