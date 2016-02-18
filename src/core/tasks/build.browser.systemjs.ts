import * as path from "path";

import * as _ from "lodash";
import * as Builder from "systemjs-builder";

import buildBrowserTsc from "./build.browser.tsc";
import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations, options?: any) {

  buildBrowserTsc(gulp, locations, options);

  gulp.task("build.browser.systemjs", ["build.browser.tsc"], function () {
    let root = locations.config.project.root;
    let builder = new Builder(".", path.relative(root, locations.config.project.systemjsConfig));

    let relativeBrowserMain = "browser/main.js"; // path.relative(browserDir, browserMain);

    let systemDir = locations.getBuildDirectory("systemjs");
    let buildDir = locations.getBuildDirectory("browser");

    let relativeInput = path.relative(root, path.resolve(systemDir, relativeBrowserMain));
    let relativeOutput = path.relative(root, path.resolve(buildDir, relativeBrowserMain));

    return builder
      .buildStatic(relativeInput, relativeOutput);

  });
};
