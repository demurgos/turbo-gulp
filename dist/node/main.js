"use strict";
var locations_1 = require("./config/locations");
var build_1 = require("./tasks/build");
var clean_1 = require("./tasks/clean");
var install_1 = require("./tasks/install");
var project_1 = require("./tasks/project");
var test_1 = require("./tasks/test");
exports.config = {
    Locations: locations_1.default
};
exports.tasks = {
    build: build_1.default,
    clean: clean_1.default,
    install: install_1.default,
    project: project_1.default,
    test: test_1.default
};
