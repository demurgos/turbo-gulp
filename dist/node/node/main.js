var locations_1 = require("../core/config/locations");
var build_1 = require("../core/tasks/build");
var install_1 = require("../core/tasks/install");
var project_1 = require("../core/tasks/project");
var test_1 = require("../core/tasks/test");
exports.config = {
    Locations: locations_1.default
};
exports.tasks = {
    build: build_1.default,
    install: install_1.default,
    project: project_1.default,
    test: test_1.default
};
