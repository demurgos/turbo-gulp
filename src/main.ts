import configLocations from "./config/locations";
import tasksBuild from "./tasks/build";
import tasksInstall from "./tasks/install";
import tasksProject from "./tasks/project";
import tasksTest from "./tasks/test";

export var config = {
  Locations: configLocations
};

export var tasks = {
  build: tasksBuild,
  install: tasksInstall,
  project: tasksProject,
  test: tasksTest
};
