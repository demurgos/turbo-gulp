import * as _ from "lodash";

import * as installJspm from "./install.jspm";
import * as installNpm from "./install.npm";
import * as installTypings from "./install.typings";
import Locations from "../config/locations";

export const taskName = "install";

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

export function registerTask (gulp: any, locations: Locations, userOptions?: any) {
  let installOptions: InstallConfig = <InstallConfig> _.merge({}, defaultInstall, userOptions);
  let installTasks: string[] = [];

  if (installOptions.jspm) {
    installTasks.push(installJspm.taskName);
    installJspm.registerTask(gulp, locations, userOptions || {});
  }

  if (installOptions.npm) {
    installTasks.push(installNpm.taskName);
    installNpm.registerTask(gulp, locations, userOptions || {});
  }

  if (installOptions.typings) {
    installTasks.push(installTypings.taskName);
    installTypings.registerTask(gulp, locations, userOptions || {});
  }

  gulp.task(taskName, installTasks);
}

export default registerTask;
