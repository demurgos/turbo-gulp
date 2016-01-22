"use strict";

var path = require('path');
var _ = require('lodash');

var defaultLocations = {
  root: process.cwd(),
  src: {
    dir: 'src',
    core: 'src/core',
    browser: 'src/browser',
    browserMain: 'src/browser/main',
    node: 'src/node'
  },
  build: {
    dir: 'build',
    node: 'build/node',
    browser: 'build/browser',
    systemjs: 'build/systemjs',
    coverage: 'build/coverage'
  },
  tmp: {
    dir: 'tmp'
  },
  definitions: {
    typings: 'typings',
    customDefinitions: 'custom_definitions'
  }
};

function Locations(userLocations) {
  _.merge(this, defaultLocations, userLocations);
}

Locations.prototype.getRootDir = function() {
  return this.root;
};

Locations.prototype.getPackage = function() {
  return path.join(this.root, 'package.json');
};

Locations.prototype.getSystemJSConfig = function() {
  return path.join(this.root, 'systemjs.config.js');
};

Locations.prototype.getSrcDir = function() {
  return path.join(this.root, this.src.dir);
};

Locations.prototype.getSrcCoreDir = function() {
  return path.join(this.root, this.src.core);
};

Locations.prototype.getSrcNodeDir = function() {
  return path.join(this.root, this.src.node);
};

Locations.prototype.getSrcBrowserDir = function() {
  return path.join(this.root, this.src.browser);
};

Locations.prototype.getSrcBrowserMain = function() {
  return path.join(this.root, this.src.browserMain);
};

Locations.prototype.getBuildDir = function() {
  return path.join(this.root, this.build.dir);
};

Locations.prototype.getBuildNodeDir = function() {
  return path.join(this.root, this.build.node);
};

Locations.prototype.getBuildNodeTestDir = function() {
  return path.join(this.root, this.build.node + '-test');
};

Locations.prototype.getBuildSystemJSDir = function() {
  return path.join(this.root, this.build.systemjs);
};

Locations.prototype.getBuildBrowserDir = function() {
  return path.join(this.root, this.build.browser);
};

Locations.prototype.getTypingsDir = function() {
  return path.join(this.root, this.definitions.typings);
};

Locations.prototype.getCustomDefinitionsDir = function() {
  return path.join(this.root, this.definitions.customDefinitions);
};

Locations.prototype.getDefinitionsBrowser = function() {
  return [
    path.join(this.getTypingsDir(), 'browser.d.ts'),
    path.join(this.getCustomDefinitionsDir(), '**/*.d.ts')
  ];
};

Locations.prototype.getDefinitionsNode = function() {
  return [
    path.join(this.getTypingsDir(), 'main.d.ts'),
    path.join(this.getCustomDefinitionsDir(), '**/*.d.ts')
  ];
};

Locations.prototype.getSourcesNode = function(withTests) {
  var sources = [];

  sources = sources.concat(this.getDefinitionsNode());
  sources.push(this.getSrcCoreDir()+'/**/*.ts');
  sources.push(this.getSrcNodeDir()+'/**/*.ts');
  if(!withTests){
    sources.push('!**/*.spec.ts');
  }

  return sources;
};

module.exports = Locations;
