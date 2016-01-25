var Promise = require('bluebird');
var childProcess = require('child_process');
var fs = require('fs');

var execFileAsync = Promise.promisify(childProcess.execFile);

exports.exec = function exec(cmd, args, options){
  args.unshift(cmd);
  return execFileAsync('git', args, options);
};

exports.ensureCleanMaster = function ensureCleanMaster(options){
  return exec('symbolic-ref', ['HEAD'])
    .then(function (stdout) {
      if (stdout.trim() !== 'refs/heads/master') {
        throw new Error('Not on master branch');
      }
      return execGit('status', ['--porcelain']);
    })
    .then(function (stdout) {
      if (stdout.trim().length) {
        throw new Error('Working copy is dirty');
      }
    });
};

/*

  const ensureCleanBranch = () => {
      if (getHashFor('HEAD') !== getHashFor(branch)) {
          throw new UsageError(`You need to be on the "${ branch
              }" branch to run this script`);
      }
      if (getHashFor(branch) !== getHashFor(`${ remoteName }/${ branch }`)) {
          throw new UsageError('You need to push your changes first');
      }
      if (run('git status -s').length) {
          throw new UsageError(
              'You have uncommited changes! Commit them before running this script');
      }
  };

*/

// checks if the tag exists
exports.checkTag = function checkTag(tag){
  return exec('tag', ['-l', tag])
    .then(function (stdout) {
      return !!stdout.trim().length;
    });
};
