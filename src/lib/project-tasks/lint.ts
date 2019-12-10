/**
 * This module defines the `lint` project task.
 *
 * @module project-tasks/lint
 * @internal
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import { existsSync as fileExistsSync, readFileSync } from "fs";
import { Furi, join as furiJoin } from "furi";
import { default as gulpTslint, PluginOptions as GulpTslintOptions } from "gulp-tslint";
import { posix as path } from "path";
import * as tslint from "tslint";
import { Configuration as TslintConfiguration } from "tslint";
import {
  CompilerHost,
  createCompilerHost,
  createProgram,
  ParseConfigHost,
  ParsedCommandLine,
  parseJsonConfigFileContent,
  Program,
  sys as tsSys,
} from "typescript";
import Undertaker from "undertaker";
import { fileURLToPath } from "url";
import vinylFs from "vinyl-fs";
import { DEFAULT_TYPED_TSLINT_CONFIG } from "../options/tslint";
import { ResolvedProject } from "../project";
import { MatcherUri } from "../utils/matcher";

export const taskName: string = "lint";

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

function createTsProgram(tsconfigJson: any, basePath: string): Program {
  const parseConfigHost: ParseConfigHost = {
    useCaseSensitiveFileNames: true,
    readDirectory: tsSys.readDirectory,
    fileExists: fileExistsSync,
    readFile: (path: string) => readFileSync(path, "utf8"),
  };
  const parsed: ParsedCommandLine = parseJsonConfigFileContent(tsconfigJson, parseConfigHost, basePath, {noEmit: true});
  const host: CompilerHost = createCompilerHost(parsed.options, true);
  return createProgram(parsed.fileNames, parsed.options, host);
}

export function registerTask(taker: Undertaker, project: ResolvedProject) {
  type TslintRawConfig = TslintConfiguration.RawConfigFile;
  type TslintConfig = TslintConfiguration.IConfigurationFile;

  let configuration: TslintConfig;

  const baseConfig: TslintConfig = TslintConfiguration
    .parseConfigFile(DEFAULT_TYPED_TSLINT_CONFIG, fileURLToPath(project.absRoot));

  if (project.tslint !== undefined && project.tslint.configuration !== undefined) {
    const userRawConfig: TslintRawConfig | string = project.tslint.configuration;
    let userConfig: TslintConfig;
    if (typeof userRawConfig === "string") {
      const configPath: string = fileURLToPath(furiJoin(project.absRoot, [userRawConfig]));
      userConfig = TslintConfiguration.loadConfigurationFromPath(configPath);
    } else {
      userConfig = TslintConfiguration.parseConfigFile(userRawConfig, fileURLToPath(project.absRoot));
    }
    configuration = TslintConfiguration.extendConfigurationFile(baseConfig, userConfig);
  } else {
    configuration = baseConfig;
  }

  const program: Program = createTsProgram({compilerOptions: {}}, fileURLToPath(project.absRoot));

  const options: any = {
    emitError: true,
    formatter: "msbuild",
    tslint,
    ...(project.tslint as GulpTslintOptions),
    configuration,
    program,
  };

  const sources: Sources = getSources(project);

  taker.task(taskName, function () {
    return vinylFs.src(sources.sources, {base: fileURLToPath(sources.baseDir)})
      .pipe(gulpTslint(options))
      .pipe(gulpTslint.report({summarizeFailureOutput: true}));
  });
}
