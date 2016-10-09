import * as projectLintTs from "./project.lint";
import * as projectBumpMajor from "./project.bump-major";
import * as projectBumpMinor from "./project.bump-minor";
import * as projectBumpPatch from "./project.bump-patch";
import * as projectDistNode from "./project.dist.node";
import Locations from "../config/locations";

export const taskName = "project";

export function registerTask (gulp: any, locations: Locations, userOptions?: any) {
  projectLintTs(gulp, locations, userOptions);
  projectBumpMajor(gulp, locations, userOptions);
  projectBumpMinor(gulp, locations, userOptions);
  projectBumpPatch(gulp, locations, userOptions);
  projectDistNode(gulp, locations, userOptions);

  gulp.task(taskName, ["project.lint"]);
}

export default registerTask;
