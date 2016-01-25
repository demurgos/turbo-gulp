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

function release(version, locations){
  var tag = 'v'+version;
  var message = 'Release '+tag;
  return Promise.all([
      readPackage(locations),
      ensureUnusedTag(tag),
      git.ensureCleanMaster()
    ])
    .spread(function(pkg, tagResult, cleanResult) {
      pkg.version = newVersion;
      return writePackage(pkg, locations);
    })
    .then(function() {
      return git.exec('add', [locations.getPackage()]);
    }).then(function(){
      return git.exec('commit', ['-m', message]);
    }).then(function(){
      return git.exec('tag', ['-a', tag, '-m', message]);
    });
}

function readPackage(locations){
  return readFile(locations.getPackage()).then(JSON.parse);
}

function writePackage(data, locations){
  return writeFile(locations.getPackage(), JSON.stringify(data, null, 2));
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
