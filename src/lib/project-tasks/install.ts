import * as installNpm from "./install.npm";
import * as installTypings from "./install.typings";
import {ProjectOptions} from "../config/config";
import {Gulp} from "gulp";

export const taskName = ":install";

export interface Options {
  project: ProjectOptions;
  install: {
    npm: boolean;
    typings: boolean;
  };
}

export function registerTask(gulp: Gulp, options: Options) {
  const installTasks: string[] = [];

  if (!(options.install && options.install.npm === false)) {
    installTasks.push(installNpm.taskName);
    installNpm.registerTask(gulp, options);
  }

  if (!(options.install && options.install.typings === false)) {
    installTasks.push(installTypings.taskName);
    installTypings.registerTask(gulp, options);
  }

  gulp.task(taskName, gulp.parallel(...installTasks));
}

export default registerTask;
