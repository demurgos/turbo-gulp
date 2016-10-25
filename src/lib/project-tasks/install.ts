import * as installNpm from "./install.npm";
import * as installTypings from "./install.typings";
import {ProjectOptions} from "../config/config";

export const taskName = "install";

interface InstallConfig {
}

const defaultInstall: InstallConfig = {
  npm: true,
  typings: true
};

export interface Options {
  project: ProjectOptions;
  install: {
    npm: boolean;
    typings: boolean;
  }
}

export function registerTask (gulp: any, options: Options) {
  const installTasks: string[] = [];

  if (options.install.npm) {
    installTasks.push(installNpm.taskName);
    installNpm.registerTask(gulp, options);
  }

  if (options.install.npm) {
    installTasks.push(installTypings.taskName);
    installTypings.registerTask(gulp, options);
  }

  gulp.task(taskName, installTasks);
}

export default registerTask;
