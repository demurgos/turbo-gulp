"use strict";
const childProcess = require("child_process");
const Bluebird = require("bluebird");
let execFileAsync = Bluebird.promisify(childProcess.execFile);
function exec(cmd, args = [], options) {
    args.unshift(cmd);
    return execFileAsync("git", args, options);
}
exports.exec = exec;
function ensureCleanMaster(options) {
    return exec("symbolic-ref", ["HEAD"])
        .then(function (stdout) {
        if (stdout.toString("utf8").trim() !== "refs/heads/master") {
            throw new Error("Not on master branch");
        }
        return exec("status", ["--porcelain"]);
    })
        .then(function (stdout) {
        if (stdout.toString("utf8").trim().length) {
            throw new Error("Working copy is dirty");
        }
    });
}
exports.ensureCleanMaster = ensureCleanMaster;
// checks if the tag exists
function checkTag(tag) {
    return exec("tag", ["-l", tag])
        .then((stdout) => {
        return stdout.toString("utf8").trim().length > 0;
    });
}
exports.checkTag = checkTag;
