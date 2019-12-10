/**
 * This module defines the `format` project task.
 *
 * @module project-tasks/format
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { Furi, join as furiJoin } from "furi";
import { default as gulpTslint, PluginOptions as GulpTslintOptions } from "gulp-tslint";
import { posix as path } from "path";
import * as tslint from "tslint";
import Undertaker from "undertaker";
import vinylFs from "vinyl-fs";
import { DEFAULT_UNTYPED_TSLINT_CONFIG } from "../options/tslint";
import { ResolvedProject } from "../project";
import { MatcherUri } from "../utils/matcher";

export const taskName: string = "format";

/**
 * Sources to use when compiling TS code
 */
export interface Sources {
  /**
   * Base directory to use when expanding glob stars.
   */
  baseDir: Furi;

  /**
   * List of absolute patterns for the sources (script or type definition) files
   */
  sources: string[];
}

export function getSources(project: ResolvedProject): Sources {
  const baseDir: Furi = project.absRoot;
  const sources: string[] = [];
  let patterns: string[];

  if (project.tslint !== undefined && project.tslint.files !== undefined) {
    patterns = project.tslint.files;
  } else {
    patterns = [path.join(project.srcDir, "**/*.ts")];
  }

  for (const pattern of patterns) {
    sources.push(MatcherUri.from(baseDir, pattern).toMinimatchString());
  }

  return {baseDir, sources};
}

export function registerTask(taker: Undertaker, project: ResolvedProject) {
  type TslintRawConfig = tslint.Configuration.RawConfigFile;
  type TslintConfig = tslint.Configuration.IConfigurationFile;

  let configuration: TslintConfig;

  const baseConfig: TslintConfig = tslint.Configuration
    .parseConfigFile(DEFAULT_UNTYPED_TSLINT_CONFIG, project.absRoot.toSysPath());

  if (project.tslint !== undefined && project.tslint.configuration !== undefined) {
    const userRawConfig: TslintRawConfig | string = project.tslint.configuration;
    let userConfig: TslintConfig;
    if (typeof userRawConfig === "string") {
      const configPath: string = furiJoin(project.absRoot, [userRawConfig]).toSysPath();
      userConfig = tslint.Configuration.loadConfigurationFromPath(configPath);
    } else {
      userConfig = tslint.Configuration.parseConfigFile(userRawConfig, project.absRoot.toSysPath());
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

  taker.task(taskName, function () {
    return vinylFs.src(sources.sources, {base: sources.baseDir.toSysPath()})
      .pipe(gulpTslint(options))
      .pipe(gulpTslint.report({
        summarizeFailureOutput: true,
      }));
  });
}
