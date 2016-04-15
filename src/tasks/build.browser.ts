import buildBrowserSystemjs from "./build.browser.systemjs";
import Locations from "../config/locations";

export default function registerTask (gulp: any, locations: Locations, options?: any) {
  buildBrowserSystemjs(gulp, locations, options);
  gulp.task("build.browser", ["build.browser.systemjs"]);
};
