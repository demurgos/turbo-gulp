var fs = require('fs');

var Promise = require('bluebird');
var semver = require('semver');

var git = require('./git');

var readFile = Promise.promisify(fs.readFile);
var writeFile = Promise.promisify(fs.writeFile);

exports.ensureUnusedTag = function ensureUnusedTag(tag){
  return git.checkTag(tag)
    .then(function(exists){
      if(exists){
        throw new Error('Tag '+tag+' already exists');
      }
      return true;
    });
};

exports.release = function(version, locations){
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
};

exports.readPackage = function readPackage(locations){
  return readFile(locations.getPackage()).then(JSON.parse);
};

exports.writePackage = function writePackage(data, locations){
  return writeFile(locations.getPackage(), JSON.stringify(data, null, 2));
};

// type: major/minor/patch
exports.getNextVersion = function getNextVersion(type, locations){
  return readPackage(locations)
    .then(function(pkg){
      return semver.inc(oldVersion, pkg.version);
    });
};

gulp.task('release', function (done) {
  runSequence('clean', 'build', function () {
    var tag;
    return ensureCleanMaster()
      .then(ensureValidVersion)
      .then(function (res) {
        tag = res;
        return new Promise(function (resolve, reject) {
          inquirer.prompt([{
            type: 'confirm',
            name: 'release',
            message: 'Ready to release ' + tag + '. Continue ?'
          }], resolve);
        });
      })
      .then(function (res) {
        if(!res.release){
          throw new Error('Aborting');
        }
        return execGit('tag', ['-a', tag, '-m', 'release '+tag]);
      })
      .asCallback(done);
  });
});

gulp.task('release.patch', []);
gulp.task('release.minor', []);
gulp.task('release.major', []);

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file));
}



