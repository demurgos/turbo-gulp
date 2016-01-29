var childProcess = require("child_process");
var Promise = require("bluebird");
var execFileAsync = Promise.promisify(childProcess.execFile);
function exec(cmd, args, options) {
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
        .then(function (stdout) {
        return !!stdout.toString("utf8").trim().length;
    });
}
exports.checkTag = checkTag;
