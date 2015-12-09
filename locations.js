var path = require('path');
var _ = require('lodash');

module.exports = function(options){
  
  var optLocations = (options && options.locations) ? options.locations : {};
  
  var root = optLocations.root || process.cwd();

  var locs = {};
  locs.root = root;
  locs.src = path.join(root, "src");
  locs.release = path.join(root, "build", "release");
  locs.debug = path.join(root, "build", "debug");
  locs.browser = path.join(root, "build", "browser");
  locs.browserTmp = path.join(root, "build", "tmp");
  locs.instrumented = path.join(root, "build", "instrumented");
  locs.coverage = path.join(root, "coverage");

  locs.definitions = path.join(root, "definitions", "project");

  locs.tsdTypings = path.join(root, "definitions", "tsd");
  locs.personnalTypings = path.join(root, "definitions", "personnal");

  locs.browserMain = path.join(locs.src, "browser", "main");
  
  return _.assign({}, locs, optLocations);
};

