import * as buildTools from "turbo-gulp"; // Going meta
// import * as buildTools from "./build/lib/index";

import gulp from "gulp";
import minimist from "minimist";

gulp.registry()

interface Options {
  devDist?: string;
}

const options: Options & minimist.ParsedArgs = minimist(process.argv.slice(2), {
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
  outModules: buildTools.OutModules.Both,
  dist: {
    packageJsonMap: (old: buildTools.PackageJson): buildTools.PackageJson => {
      const version: string = options.devDist !== undefined ? `${old.version}-build.${options.devDist}` : old.version;
      return <any> {...old, version, scripts: undefined, private: false};
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
      repository: "git@github.com:demurgos/turbo-gulp.git",
      branch: "gh-pages",
    },
  },
  copy: [
    {
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
  outModules: buildTools.OutModules.Both,
  tscOptions: {
    skipLibCheck: true,
  },
  copy: [
    {
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
gulp.task("default", libTasks.dist);
