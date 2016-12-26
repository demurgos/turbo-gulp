import {Gulp} from "gulp";
import {default as gulpTslint, PluginOptions as GulpTslintOptions} from "gulp-tslint";
import {posix as path} from "path";
import tslint = require("tslint");
import {Minimatch} from "minimatch";
import {ProjectOptions} from "../config/config";
import defaultTslintConfig from "../config/tslint";
import * as matcher from "../utils/matcher";

export const taskName: string = ":lint";

/**
 * Sources to use when compiling TS code
 */
export interface Sources {
  /**
   * Base directory to use when expanding glob stars.
   */
  baseDir: string;

  /**
   * List of absolute patterns for the sources (script or type definition) files
   */
  sources: string[];
}

export function getSources(project: ProjectOptions): Sources {
  const baseDir: string = project.root;
  const sources: string[] = [];
  let patterns: string[];

  if (project.tslint !== undefined && project.tslint.files !== undefined) {
    patterns = project.tslint.files;
  } else {
    patterns = [path.join(project.srcDir, "**/*.ts")];
  }

  for (const pattern of patterns) {
    const minimatchPattern: Minimatch = new Minimatch(pattern);
    const glob: string = matcher.asString(matcher.join(baseDir, minimatchPattern));
    sources.push(glob);
  }

  return {baseDir, sources};
}

export function registerTask(gulp: Gulp, project: ProjectOptions) {
  const options: GulpTslintOptions = Object.assign({}, {
    emitError: true,
    configuration: defaultTslintConfig,
    formatter: "verbose",
    tslint: tslint
  }, project.tslint);

  const sources: Sources = getSources(project);

  gulp.task(taskName, function () {
    return gulp.src(sources.sources, {base: sources.baseDir})
      .pipe(gulpTslint(options))
      .pipe(gulpTslint.report());
  });
}

export default registerTask;
