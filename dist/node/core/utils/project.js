var fs = require('fs');
var Promise = require('bluebird');
var semver = require('semver');
var git = require('./git');
var readFile = Promise.promisify(fs.readFile);
var writeFile = Promise.promisify(fs.writeFile);
function ensureUnusedTag(tag) {
    return git.checkTag(tag)
        .then(function (exists) {
        if (exists) {
            throw new Error('Tag ' + tag + ' already exists');
        }
        return true;
    });
}
exports.ensureUnusedTag = ensureUnusedTag;
function getVersionTag(version) {
    return 'v' + version;
}
exports.getVersionTag = getVersionTag;
function getVersionMessage(version) {
    return 'Release v' + version;
}
exports.getVersionMessage = getVersionMessage;
function commitVersion(version, locations) {
    var tag = getVersionTag(version);
    var message = getVersionMessage(version);
    return git.exec('add', ['.'])
        .then(function () {
        return git.exec('commit', ['-m', message]);
    })
        .then(function () {
        return git.exec('tag', ['-a', tag, '-m', message]);
    });
}
exports.commitVersion = commitVersion;
function release(version, locations) {
    return Promise.all([
        ensureUnusedTag(getVersionTag(version)),
        git.ensureCleanMaster()
    ])
        .then(function () {
        return setPackageVersion(version, locations);
    })
        .then(function () {
        return commitVersion(version, locations);
    });
}
exports.release = release;
function readPackage(locations) {
    return readFile(locations.getPackage()).then(JSON.parse);
}
exports.readPackage = readPackage;
function writePackage(data, locations) {
    return writeFile(locations.getPackage(), JSON.stringify(data, null, 2));
}
exports.writePackage = writePackage;
function setPackageVersion(version, locations) {
    return readPackage(locations)
        .spread(function (pkg) {
        pkg.version = version;
        return writePackage(pkg, locations);
    });
}
exports.setPackageVersion = setPackageVersion;
// type: major/minor/patch
function getNextVersion(type, locations) {
    return readPackage(locations)
        .then(function (pkg) {
        return semver.inc(pkg.version, type);
    });
}
exports.getNextVersion = getNextVersion;
