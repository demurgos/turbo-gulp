import configLocations from "./config/config";
import taskBuild from "./tasks/build";
import taskClean from "./tasks/clean";
import taskInstall from "./tasks/install";
import taskProject from "./tasks/project";
import taskTest from "./tasks/test";

export const config = {
  Locations: configLocations
};

export const tasks = {
  build: taskBuild,
  clean: taskClean,
  install: taskInstall,
  project: taskProject,
  test: taskTest
};
