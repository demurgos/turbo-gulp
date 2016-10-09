import Locations from "../config/locations";

import * as _ from "lodash";

import * as buildNode from "./build.node";
import * as buildNodeTest from "./build.node-test";
import * as buildBrowser from "./build.browser";
import * as buildElectron from "./build.electron";

export const taskName = "build";

interface BuildOptions {
  node: boolean;
  browser: boolean;
  electron: boolean;
}

let defaultBuilds: BuildOptions = {
  node: true,
  browser: true,
  electron: true
};

export function registerTask (gulp: any, locations: Locations, userOptions?: any) {
  let buildOptions: BuildOptions = <BuildOptions> _.assign({}, defaultBuilds, userOptions);
  let buildTasks: string[] = [];

  if (buildOptions.node) {
    buildTasks.push(buildNode.taskName);
    buildNode.registerTask(gulp, locations, userOptions);

    buildTasks.push(buildNodeTest.taskName);
    buildNodeTest.registerTask(gulp, locations, userOptions);
  }

  if (buildOptions.browser) {
    buildTasks.push(buildBrowser.taskName);
    buildBrowser.registerTask(gulp, locations, userOptions);
  }

  if (buildOptions.electron) {
    buildTasks.push(buildElectron.taskName);
    buildElectron.registerTask(gulp, locations, userOptions);
  }

  gulp.task(taskName, buildTasks);
}

export default registerTask;
