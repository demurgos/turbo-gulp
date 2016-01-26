var Promise = require('bluebird');
var childProcess = require('child_process');
var fs = require('fs');

var execFileAsync = Promise.promisify(childProcess.execFile);

function exec(cmd, args: string[], options?: any){
  args.unshift(cmd);
  return execFileAsync('git', args, options);
}

function ensureCleanMaster(options){
  return exec('symbolic-ref', ['HEAD'])
    .then(function (stdout) {
      if (stdout.trim() !== 'refs/heads/master') {
        throw new Error('Not on master branch');
      }
      return exec('status', ['--porcelain']);
    })
    .then(function (stdout) {
      if (stdout.trim().length) {
        throw new Error('Working copy is dirty');
      }
    });
}

// checks if the tag exists
function checkTag(tag){
  return exec('tag', ['-l', tag])
    .then(function (stdout) {
      return !!stdout.trim().length;
    });
}

exports.exec = exec;
exports.ensureCleanMaster = ensureCleanMaster;
exports.checkTag = checkTag;
