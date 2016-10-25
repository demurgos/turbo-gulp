"use strict";
const bumpMajor = require("./bump-major");
exports.bumpMajor = bumpMajor;
const bumpMinor = require("./bump-minor");
exports.bumpMinor = bumpMinor;
const bumpPatch = require("./bump-patch");
exports.bumpPatch = bumpPatch;
const install = require("./install");
exports.install = install;
const installNpm = require("./install.npm");
exports.installNpm = installNpm;
const installTypings = require("./install.typings");
exports.installTypings = installTypings;
const lint = require("./lint");
exports.lint = lint;
function registerAll(gulp, options) {
    bumpMajor.registerTask(gulp, options);
    bumpMinor.registerTask(gulp, options);
    bumpPatch.registerTask(gulp, options);
    install.registerTask(gulp, options);
    lint.registerTask(gulp, options);
}
exports.registerAll = registerAll;
