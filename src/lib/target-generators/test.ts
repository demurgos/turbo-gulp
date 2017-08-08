import {Gulp} from "gulp";
import {TaskFunc} from "orchestrator";
import {Project} from "../project";
import {TestTarget} from "../targets";
import * as testNode from "../task-generators/test-node";
import {generateTarget as generateNodeTarget, Locations, resolveLocations} from "./node";

export function generateTarget(gulp: Gulp, project: Project, target: TestTarget) {
  const targetName: string = target.name;
  const locations: Locations = resolveLocations(project, target);

  generateNodeTarget(gulp, project, target);

  // tslint:disable-next-line:typedef
  const taskNames = {
    build: `${targetName}:build`,
    run: `${targetName}:run`,
  };

  gulp.task(taskNames.run, testNode.generateTask(gulp, {testDir: locations.buildDir}));
  gulp.task(targetName, <any> gulp.series(taskNames.build, taskNames.run) as TaskFunc);
}
