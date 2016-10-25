import * as projectLint from "./project.lint";
import * as projectBumpMajor from "./project.bump-major";
import * as projectBumpMinor from "./project.bump-minor";
import * as projectBumpPatch from "./project.bump-patch";
import * as projectDistNode from "./project.dist.node";
import Locations from "../config/config";

export const taskName = "project";

export function registerTask (gulp: any, locations: Locations, userOptions?: any) {
  projectLint.registerTask(gulp, locations, userOptions);
  projectBumpMajor.registerTask(gulp, locations, userOptions);
  projectBumpMinor.registerTask(gulp, locations, userOptions);
  projectBumpPatch.registerTask(gulp, locations, userOptions);
  projectDistNode.registerTask(gulp, locations, userOptions);

  gulp.task(taskName, [projectLint.taskName]);
}

export default registerTask;
