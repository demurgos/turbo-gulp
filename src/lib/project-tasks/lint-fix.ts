import { Gulp } from "gulp";
import {default as gulpTslint, PluginOptions as GulpTslintOptions } from "gulp-tslint";
import { IMinimatch, Minimatch } from "minimatch";
import {posix as path } from "path";
import * as tslint from "tslint";
import { DEFAULT_UNTYPED_TSLINT_CONFIG } from "../options/tslint";
import { Project } from "../project";
import * as matcher from "../utils/matcher";

export const taskName: string = ":lint:fix";

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

export function getSources(project: Project): Sources {
  const baseDir: string = project.root;
  const sources: string[] = [];
  let patterns: string[];

  if (project.tslint !== undefined && project.tslint.files !== undefined) {
    patterns = project.tslint.files;
  } else {
    patterns = [path.join(project.srcDir, "**/*.ts")];
  }

  for (const pattern of patterns) {
    const minimatchPattern: IMinimatch = new Minimatch(pattern);
    const glob: string = matcher.asString(matcher.join(baseDir, minimatchPattern));
    sources.push(glob);
  }

  return {baseDir, sources};
}

export function registerTask(gulp: Gulp, project: Project) {
  type TslintRawConfig = tslint.Configuration.RawConfigFile;
  type TslintConfig = tslint.Configuration.IConfigurationFile;

  let configuration: TslintConfig;

  const baseConfig: TslintConfig = tslint.Configuration.parseConfigFile(DEFAULT_UNTYPED_TSLINT_CONFIG, project.root);

  if (project.tslint !== undefined && project.tslint.configuration !== undefined) {
    const userRawConfig: TslintRawConfig | string = project.tslint.configuration;
    let userConfig: TslintConfig;
    if (typeof userRawConfig === "string") {
      const configPath: string = path.join(project.root, userRawConfig);
      userConfig = tslint.Configuration.loadConfigurationFromPath(configPath);
    } else {
      userConfig = tslint.Configuration.parseConfigFile(userRawConfig, project.root);
    }
    configuration = tslint.Configuration.extendConfigurationFile(baseConfig, userConfig);
  } else {
    configuration = baseConfig;
  }

  const options: GulpTslintOptions = {
    formatter: "msbuild",
    tslint,
    ...(project.tslint as GulpTslintOptions),
    configuration,
    fix: true,
  };

  const sources: Sources = getSources(project);

  gulp.task(taskName, function () {
    return gulp.src(sources.sources, {base: sources.baseDir})
      .pipe(gulpTslint(options))
      .pipe(gulpTslint.report({
        summarizeFailureOutput: true,
      }));
  });
}
