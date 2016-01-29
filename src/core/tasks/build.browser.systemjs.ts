import * as path from "path";

import * as _ from "lodash";
import * as Builder from "systemjs-builder";

import buildBrowserTsc from "./build.browser.tsc";
import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations, options?: any) {

  buildBrowserTsc(gulp, locations, options);

  gulp.task("build.browser.systemjs", ["build.browser.tsc"], function () {
    let builder = new Builder(locations.config.project.root, locations.config.project.systemjsConfig);

    /*var browserDir = locations.getSrcBrowserDir();
    var browserMain = locations.getSrcBrowserMain();*/

    let relativeBrowserMain = "browser/main"; // path.relative(browserDir, browserMain);

    let systemDir = locations.getBuildDirectory("systemjs");
    let buildDir = locations.getBuildDirectory("browser");

    return builder
      .build(path.resolve(systemDir, relativeBrowserMain), path.resolve(buildDir, relativeBrowserMain));

  });
};
