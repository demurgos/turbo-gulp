"use strict";
const fs = require("fs");
const Bluebird = require("bluebird");
const semver = require("semver");
const git = require("./git");
const readFile = Bluebird.promisify(fs.readFile);
const writeFile = Bluebird.promisify(fs.writeFile);
function ensureUnusedTag(tag) {
    return git.checkTag(tag)
        .then((exists) => {
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
    let tag = getVersionTag(version);
    let message = getVersionMessage(version);
    return git.exec("add", ["."])
        .then(() => {
        return git.exec("commit", ["-m", message]);
    })
        .then(() => {
        return git.exec("tag", ["-a", tag, "-m", message]);
    });
}
exports.commitVersion = commitVersion;
function release(version, locations) {
    return Bluebird.all([
        ensureUnusedTag(getVersionTag(version)),
        git.ensureCleanMaster()
    ])
        .then(() => {
        return setPackageVersion(version, locations);
    })
        .then(() => {
        return commitVersion(version, locations.root);
    });
}
exports.release = release;
function readPackage(locations) {
    return readFile(locations.package, "utf8")
        .then((content) => {
        return JSON.parse(content);
    });
}
exports.readPackage = readPackage;
function writePackage(pkg, locations) {
    return writeFile(locations.package, JSON.stringify(pkg, null, 2));
}
exports.writePackage = writePackage;
function setPackageVersion(version, locations) {
    return readPackage(locations)
        .then((pkg) => {
        pkg.version = version;
        return writePackage(pkg, locations);
    });
}
exports.setPackageVersion = setPackageVersion;
function getNextVersion(bumpKind, locations) {
    return readPackage(locations)
        .then((pkg) => {
        return semver.inc(pkg.version, bumpKind);
    });
}
exports.getNextVersion = getNextVersion;
function bumpVersion(bumpKind, locations) {
    return getNextVersion(bumpKind, locations)
        .then((nextVersion) => {
        return release(nextVersion, locations);
    });
}
exports.bumpVersion = bumpVersion;
