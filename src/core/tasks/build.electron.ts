import buildElectronTsc from "./build.electron.tsc";
import buildElectronBrowser from "./build.electron.browser";
import buildElectronPackage from "./build.electron.package";
import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations, options?: any) {
  buildElectronTsc(gulp, locations, options || {});
  buildElectronBrowser(gulp, locations, options || {});
  buildElectronPackage(gulp, locations, options || {});
  gulp.task("build.electron", ["build.electron.tsc", "build.electron.browser", "build.electron.package"]);
};
