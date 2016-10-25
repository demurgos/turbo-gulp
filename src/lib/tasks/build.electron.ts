import * as buildElectronTsc from "./build.electron.tsc";
import * as buildElectronBrowser from "./build.electron.browser";
import * as buildElectronPackage from "./build.electron.package";
import Locations from "../config/config";

export const taskName = "build:electron";

export function registerTask (gulp: any, locations: Locations, options?: any) {
  buildElectronTsc.registerTask(gulp, locations, options || {});
  buildElectronBrowser.registerTask(gulp, locations, options || {});
  buildElectronPackage.registerTask(gulp, locations, options || {});

  gulp.task(taskName, [buildElectronTsc.taskName, buildElectronBrowser.taskName, buildElectronPackage.taskName]);
}

export default registerTask;
