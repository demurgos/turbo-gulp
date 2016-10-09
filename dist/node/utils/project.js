"use strict";
var fs = require("fs");
var Bluebird = require("bluebird");
var semver = require("semver");
var git = require("./git");
var readFile = Bluebird.promisify(fs.readFile);
var writeFile = Bluebird.promisify(fs.writeFile);
function ensureUnusedTag(tag) {
    return git.checkTag(tag)
        .then(function (exists) {
        if (exists) {
            throw new Error("Tag " + tag + " already exists");
        }
    });
}
exports.ensureUnusedTag = ensureUnusedTag;
function getVersionTag(version) {
    return "v" + version;
}
exports.getVersionTag = getVersionTag;
function getVersionMessage(version) {
    return "Release v" + version;
}
exports.getVersionMessage = getVersionMessage;
function commitVersion(version, projectRoot) {
    var tag = getVersionTag(version);
    var message = getVersionMessage(version);
    return git.exec("add", ["."])
        .then(function () {
        return git.exec("commit", ["-m", message]);
    })
        .then(function () {
        return git.exec("tag", ["-a", tag, "-m", message]);
    });
}
exports.commitVersion = commitVersion;
function release(version, locations) {
    return Bluebird.all([
        ensureUnusedTag(getVersionTag(version)),
        git.ensureCleanMaster()
    ])
        .then(function () {
        return setPackageVersion(version, locations);
    })
        .then(function () {
        return commitVersion(version, locations.config.project.root);
    });
}
exports.release = release;
function readPackage(locations) {
    return readFile(locations.config.project.package, "utf8")
        .then(function (content) {
        return JSON.parse(content);
    });
}
exports.readPackage = readPackage;
function writePackage(pkg, locations) {
    return writeFile(locations.config.project.package, JSON.stringify(pkg, null, 2));
}
exports.writePackage = writePackage;
function setPackageVersion(version, locations) {
    return readPackage(locations)
        .then(function (pkg) {
        pkg.version = version;
        return writePackage(pkg, locations);
    });
}
exports.setPackageVersion = setPackageVersion;
function getNextVersion(bumpKind, locations) {
    return readPackage(locations)
        .then(function (pkg) {
        return semver.inc(pkg.version, bumpKind);
    });
}
exports.getNextVersion = getNextVersion;
function bumpVersion(bumpKind, locations) {
    return getNextVersion(bumpKind, locations)
        .then(function (nextVersion) {
        return release(nextVersion, locations);
    });
}
exports.bumpVersion = bumpVersion;
