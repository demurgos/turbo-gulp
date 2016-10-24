"use strict";
var path = require("path");
var _ = require("lodash");
function getDefaultConfig() {
    return {
        project: {
            root: process.cwd(),
            "package": "package.json",
            "systemjsConfig": "systemjs.config.js",
            build: "build",
            dist: "dist",
            coverage: "coverage",
            sources: "src"
        },
        core: {
            base: "src",
            typescript: ["**/*.ts", "!platform/**/*.ts"],
            definitions: ["../typings/**/*.d.ts"]
        },
        targets: {
            node: {
                base: "src/platform/node",
                typescript: ["**/*.ts"],
                main: "main",
                definitions: []
            },
            browser: {
                base: "src/platform/browser",
                typescript: ["**/*.ts"],
                main: "main",
                definitions: []
            },
            electron: {
                base: "src/platform/electron",
                typescript: ["**/*.ts"],
                main: "main",
                definitions: []
            }
        }
    };
}
exports.getDefaultConfig = getDefaultConfig;
var Locations = (function () {
    function Locations(config) {
        this.config = _.merge({}, getDefaultConfig(), config);
    }
    Locations.prototype.getTypescriptSources = function (targetName, excludeSpec) {
        var _this = this;
        if (excludeSpec === void 0) { excludeSpec = false; }
        var core = this.config.core;
        var target = this.config.targets[targetName];
        var sources = [].concat(core.definitions
            .map(function (definitionPath) { return path.join(core.base, definitionPath); }), target.definitions
            .map(function (sourcePath) { return path.join(target.base, sourcePath); }), core.typescript
            .map(function (definitionPath) { return path.join(core.base, definitionPath); }), target.typescript
            .map(function (sourcePath) { return path.join(target.base, sourcePath); })).map(function (item) { return path.join(_this.config.project.root, item); });
        if (excludeSpec) {
            sources.push("!**/*.spec.ts");
        }
        return sources;
    };
    Locations.prototype.getSourceDirectory = function (targetName) {
        switch (targetName) {
            case "browser":
                return path.join(this.config.project.root, this.config.targets.browser.base);
            case "electron":
                return path.join(this.config.project.root, this.config.targets.electron.base);
            case "node":
                return path.join(this.config.project.root, this.config.targets.node.base);
            default:
                throw new Error("Unknown target " + targetName);
        }
    };
    Locations.prototype.getBuildDirectory = function (targetName) {
        return path.join(this.config.project.root, this.config.project.build, targetName);
    };
    Locations.prototype.getDistDirectory = function (targetName) {
        return path.join(this.config.project.root, this.config.project.dist, targetName);
    };
    Locations.prototype.getCoverageDirectory = function (targetName) {
        return path.join(this.config.project.root, this.config.project.coverage, targetName);
    };
    return Locations;
}());
exports.Locations = Locations;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Locations;
