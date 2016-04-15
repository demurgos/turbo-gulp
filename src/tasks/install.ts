import * as _ from "lodash";

import installJspm from "./install.jspm";
import installNpm from "./install.npm";
import installTypings from "./install.typings";
import Locations from "../config/locations";

interface InstallConfig {
  jspm: boolean;
  npm: boolean;
  typings: boolean;
}

let defaultInstall: InstallConfig = {
  jspm: true,
  npm: true,
  typings: true
};

export default function registerTask (gulp: any, locations: Locations, userOptions?: any) {

  let installOptions: InstallConfig = <InstallConfig> _.merge({}, defaultInstall, userOptions);
  let installTasks: string[] = [];

  if (installOptions.jspm) {
    installTasks.push("install.jspm");
    installJspm(gulp, locations);
  }

  if (installOptions.npm) {
    installTasks.push("install.npm");
    installNpm(gulp, locations);
  }

  if (installOptions.typings) {
    installTasks.push("install.typings");
    installTypings(gulp, locations);
  }

  gulp.task("install", installTasks);
  gulp.task("install.noNpm", _.without(installTasks, "install.npm"));

};
