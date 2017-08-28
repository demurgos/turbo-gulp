import * as buildTools from "demurgos-web-build-tools"; // Going meta
// import * as buildTools from "./build/lib/lib/index";

import * as gulp from "gulp";
import * as minimist from "minimist";
import {ParsedArgs} from "minimist";

interface Options {
  devDist?: string;
}

const options: Options & ParsedArgs = minimist(process.argv.slice(2), {
  string: ["devDist"],
  default: {devDist: undefined},
  alias: {devDist: "dev-dist"},
});

const project: buildTools.Project = {
  root: __dirname,
  packageJson: "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src",
};

const lib: buildTools.LibTarget = {
  project,
  name: "lib",
  srcDir: "src/lib",
  scripts: ["**/*.ts"],
  mainModule: "index",
  dist: {
    packageJsonMap: (old: buildTools.PackageJson): buildTools.PackageJson => {
      const version: string = options.devDist !== undefined ? `${old.version}-dev.${options.devDist}` : old.version;
      return <any> {...old, version, scripts: undefined};
    },
    npmPublish: {
      tag: options.devDist !== undefined ? "next" : "latest",
    },
  },
  customTypingsDir: "src/custom-typings",
  tscOptions: {
    skipLibCheck: true,
  },
  typedoc: {
    dir: "typedoc",
    name: "Web Build Tools",
    deploy: {
      repository: "git@github.com:demurgos/web-build-tools.git",
      branch: "gh-pages",
    },
  },
  copy: [
    {
      name: "json",
      files: ["**/*.json"],
    },
  ],
  clean: {
    dirs: ["build/lib", "dist/lib"],
  },
};

const test: buildTools.MochaTarget = {
  project,
  name: "test",
  srcDir: "src",
  scripts: ["test/**/*.ts", "lib/**/*.ts", "e2e/*/*.ts"],
  customTypingsDir: "src/custom-typings",
  tscOptions: {
    skipLibCheck: true,
  },
  copy: [
    {
      name: "e2e",
      src: "e2e",
      // <project-name>/(project|test-resources)/<any>
      files: ["*/project/**/*", "*/test-resources/**/*"],
      dest: "e2e",
    },
  ],
  clean: {
    dirs: ["build/test"],
  },
};

const libTasks: any = buildTools.registerLibTasks(gulp, lib);
buildTools.registerMochaTasks(gulp, test);
buildTools.projectTasks.registerAll(gulp, project);

gulp.task("all:tsconfig.json", gulp.parallel("lib:tsconfig.json", "test:tsconfig.json"));
gulp.task("dist", libTasks.dist);
