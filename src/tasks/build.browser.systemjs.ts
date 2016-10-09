import * as path from "path";

import * as Builder from "systemjs-builder";

import * as buildBrowserTsc from "./build.browser.tsc";
import Locations from "../config/locations";

export const taskName = "build:browser:systemjs";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  buildBrowserTsc.registerTask(gulp, locations, options);

  gulp.task(taskName, [buildBrowserTsc.taskName], function () {
    let root = locations.config.project.root;
    let builder = new Builder(".", path.relative(root, locations.config.project.systemjsConfig));

    let relativeBrowserMain = "browser/main.js"; // path.relative(browserDir, browserMain);

    let systemDir = locations.getBuildDirectory("systemjs");
    let buildDir = locations.getBuildDirectory("browser");

    let relativeInput = path.relative(root, path.resolve(systemDir, relativeBrowserMain));
    let relativeOutput = path.relative(root, path.resolve(buildDir, relativeBrowserMain));

    return builder.buildStatic(relativeInput, relativeOutput);
  });
}

export default registerTask;
