import * as path from "path";

import * as Builder from "systemjs-builder";

import * as buildBrowserTsc from "./build.browser.tsc";
import Locations from "../config/config";

export const taskName = "build:browser:systemjs";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  buildBrowserTsc.registerTask(gulp, locations, options);

  gulp.task(taskName, [buildBrowserTsc.taskName], function () {
    const root = locations.config.project.root;
    const builder = new Builder(".", path.relative(root, locations.config.project.systemjsConfig));

    const relativeBrowserMain = "browser/main.js"; // path.relative(browserDir, browserMain);

    const systemDir = locations.getBuildDirectory("systemjs");
    const buildDir = locations.getBuildDirectory("browser");

    const relativeInput = path.relative(root, path.resolve(systemDir, relativeBrowserMain));
    const relativeOutput = path.relative(root, path.resolve(buildDir, relativeBrowserMain));

    return builder.buildStatic(relativeInput, relativeOutput);
  });
}

export default registerTask;
