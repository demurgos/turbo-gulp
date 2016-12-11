import Bluebird = require("bluebird");
import {Gulp} from "gulp";
import {posix as path} from "path";
import {Target} from "../config/config";
import * as copy from "../task-generators/copy";
import {streamToPromise} from "../utils/utils";

/**
 * Generate tasks such as:
 * `${targetName}:build:copy` and each `${targetName}:build:copy:${copyName}`
 */
export function generateCopyTasks(gulp: Gulp, targetName: string, srcDir: string, buildDir: string, targetOptions: Target): void {
  if (targetOptions.copy === undefined) {
    gulp.task(`${targetName}:build:copy`, function (done: () => void) {
      done();
    });
    return;
  }

  const namedCopies: string[] = [];
  const anonymousCopies: copy.Options[] = [];

  for (const copyConfig of targetOptions.copy) {
    const from: string = copyConfig.from === undefined ? srcDir : path.join(srcDir, copyConfig.from);
    const to: string = copyConfig.to === undefined ? buildDir : path.join(buildDir, copyConfig.to);
    const config: copy.Options = {
      from: from,
      files: copyConfig.files,
      to: to
    };

    if (copyConfig.name === undefined) {
      anonymousCopies.push(config);
    } else {
      const taskName = `${targetName}:build:copy:${copyConfig.name}`;
      gulp.task(taskName, copy.generateTask(gulp, targetName, config));
      namedCopies.push(taskName);
    }
  }

  gulp.task(`${targetName}:build:copy`, gulp.parallel(...namedCopies, function _copyDefault () {
    const promises = anonymousCopies
      .map(copyOptions => streamToPromise(copy.copy(gulp, copyOptions)));

    return Bluebird.all(promises);
  }));
}
