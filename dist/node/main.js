System.register(['../core/config/locations', '../core/tasks/build', '../core/tasks/install', '../core/tasks/project', '../core/tasks/test'], function(exports_1) {
    var locations_1, build_1, install_1, project_1, test_1;
    var config, tasks;
    return {
        setters:[
            function (locations_1_1) {
                locations_1 = locations_1_1;
            },
            function (build_1_1) {
                build_1 = build_1_1;
            },
            function (install_1_1) {
                install_1 = install_1_1;
            },
            function (project_1_1) {
                project_1 = project_1_1;
            },
            function (test_1_1) {
                test_1 = test_1_1;
            }],
        execute: function() {
            exports_1("config", config = {
                Locations: locations_1.default
            });
            exports_1("tasks", tasks = {
                build: build_1.default,
                install: install_1.default,
                project: project_1.default,
                test: test_1.default
            });
        }
    }
});
