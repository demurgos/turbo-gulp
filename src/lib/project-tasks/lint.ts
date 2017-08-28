import { existsSync as fileExistsSync, readFileSync } from "fs";
import { Gulp } from "gulp";
import { default as gulpTslint, PluginOptions as GulpTslintOptions } from "gulp-tslint";
import { IMinimatch, Minimatch } from "minimatch";
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
import { DEFAULT_TYPED_TSLINT_CONFIG } from "../options/tslint";
import { Project } from "../project";
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

function createTsProgram(tsconfigJson: any, basePath: string): Program {
  const parseConfigHost: ParseConfigHost = {
    useCaseSensitiveFileNames: true,
    readDirectory: tsSys.readDirectory,
    fileExists: fileExistsSync,
    readFile: (path: string) => readFileSync(path, "utf8"),
  };
  const parsed: ParsedCommandLine = parseJsonConfigFileContent(
    tsconfigJson,
    parseConfigHost,
    basePath,
    {noEmit: true},
  );
  const host: CompilerHost = createCompilerHost(parsed.options, true);
  return createProgram(parsed.fileNames, parsed.options, host);
}

export function registerTask(gulp: Gulp, project: Project) {
  type TslintRawConfig = TslintConfiguration.RawConfigFile;
  type TslintConfig = TslintConfiguration.IConfigurationFile;

  let configuration: TslintConfig;

  const baseConfig: TslintConfig = TslintConfiguration.parseConfigFile(DEFAULT_TYPED_TSLINT_CONFIG, project.root);

  if (project.tslint !== undefined && project.tslint.configuration !== undefined) {
    const userRawConfig: TslintRawConfig | string = project.tslint.configuration;
    let userConfig: TslintConfig;
    if (typeof userRawConfig === "string") {
      const configPath: string = path.join(project.root, userRawConfig);
      userConfig = TslintConfiguration.loadConfigurationFromPath(configPath);
    } else {
      userConfig = TslintConfiguration.parseConfigFile(userRawConfig, project.root);
    }
    configuration = TslintConfiguration.extendConfigurationFile(baseConfig, userConfig);
  } else {
    configuration = baseConfig;
  }

  const program: Program = createTsProgram({compilerOptions: {}}, project.root);

  const options: GulpTslintOptions = {
    emitError: true,
    formatter: "msbuild",
    tslint,
    ...project.tslint,
    configuration,
    program,
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
