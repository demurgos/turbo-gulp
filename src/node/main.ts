import configLocations from "../core/config/locations";
import tasksBuild from "../core/tasks/build";
import tasksInstall from "../core/tasks/install";
import tasksProject from "../core/tasks/project";
import tasksTest from "../core/tasks/test";

export var config = {
  Locations: configLocations
};

export var tasks = {
  build: tasksBuild,
  install: tasksInstall,
  project: tasksProject,
  test: tasksTest
};
