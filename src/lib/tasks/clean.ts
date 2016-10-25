import * as cleanBrowser from "./clean.browser";
import * as cleanElectron from "./clean.electron";
import * as cleanNode from "./clean.node";

import {Config} from "../config/config";

export const taskName = "clean";

export function registerTask (gulp: any, locations: Config, options?: any) {
  cleanBrowser.registerTask(gulp, locations, options || {});
  cleanElectron.registerTask(gulp, locations, options || {});
  cleanNode.registerTask(gulp, locations, options || {});

  gulp.task(taskName, [cleanBrowser.taskName, cleanElectron.taskName, cleanNode.taskName]);
}

export default registerTask;
