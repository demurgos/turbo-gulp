import Locations from "../config/locations";

import * as _ from "lodash";

import buildNode from "./build.node";
import buildNodeTest from "./build.node-test";
import buildBrowser from "./build.browser";
import buildElectron from "./build.electron";

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

export default function registerTask (gulp: any, locations: Locations, userOptions?: any) {

  let buildOptions: BuildOptions = <BuildOptions> _.assign({}, defaultBuilds, userOptions);
  let buildTasks: string[] = [];

  if (buildOptions.node) {
    buildTasks.push("build.node");
    buildNode(gulp, locations, userOptions);

    buildTasks.push("build.node-test");
    buildNodeTest(gulp, locations, userOptions);
  }

  if (buildOptions.browser) {
    buildTasks.push("build.browser");
    buildBrowser(gulp, locations, userOptions);
  }

  if (buildOptions.electron) {
    buildTasks.push("build.electron");
    buildBrowser(gulp, locations, userOptions);
  }

  gulp.task("build", buildTasks);

};
