var fs = require('fs');

var Promise = require('bluebird');
var semver = require('semver');

var git = require('./git');

var readFile = Promise.promisify(fs.readFile);
var writeFile = Promise.promisify(fs.writeFile);

function ensureUnusedTag(tag){
  return git.checkTag(tag)
    .then(function(exists){
      if(exists){
        throw new Error('Tag '+tag+' already exists');
      }
      return true;
    });
}

function commitVersion(version, locations){
  var tag = 'v'+version;
  var message = 'Release '+tag;
  return git.exec('add', ['.'])
    .then(function(){
      return git.exec('commit', ['-m', message]);
    })
    .then(function(){
      return git.exec('tag', ['-a', tag, '-m', message]);
    });
}

function release(version, locations){
  return Promise.all([
      ensureUnusedTag(tag),
      git.ensureCleanMaster()
    ])
    .then(function() {
      return setPackageVersion(version, locations);
    })
    .then(function(){
      return commitVersion(version, locations);
    });
}

function readPackage(locations){
  return readFile(locations.getPackage()).then(JSON.parse);
}

function writePackage(data, locations){
  return writeFile(locations.getPackage(), JSON.stringify(data, null, 2));
}

function setPackageVersion(version, locations){
  return readPackage(locations)
    .spread(function(pkg) {
      pkg.version = newVersion;
      return writePackage(pkg, locations);
    });
}

// type: major/minor/patch
function getNextVersion(type, locations){
  return readPackage(locations)
    .then(function(pkg){
      return semver.inc(oldVersion, pkg.version);
    });
}

exports.ensureUnusedTag = ensureUnusedTag;
exports.release = release;
exports.readPackage = readPackage;
exports.writePackage = writePackage;
exports.getNextVersion = getNextVersion;
