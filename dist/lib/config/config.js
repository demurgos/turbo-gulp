"use strict";
exports.LIB_TARGET = {
    type: "node",
    baseDir: "lib",
    scripts: ["**/*.ts", "!**/*.spec.ts"],
    declarations: ["../../typings/**/*.d.ts"],
    mainModule: "index"
};
exports.LIB_TEST_TARGET = {
    type: "test",
    baseDir: "test",
    scripts: ["**/*.ts", "../lib/**/*.ts"],
    declarations: ["../typings/**/*.d.ts"],
    mainModule: "index"
};
exports.DEFAULT_CONFIG = {
    root: process.cwd(),
    "package": "package.json",
    buildDir: "build",
    distDir: "dist",
    srcDir: "src"
};
