// Sample gulpfile
const gulp = require("gulp");
const typescript = require("typescript");
const buildTools = require("./local-turbo-gulp");

const project = {
  root: __dirname,
  packageJson: "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src",
};

const lib = {
  project,
  name: "lib",
  srcDir: "src/lib",
  scripts: ["**/*.ts"],
  mainModule: "index",
  dist: {
    packageJsonMap: (old) => {
      return {...old, scripts: undefined};
    },
    npmPublish: {
      tag: "next",
    },
  },
  tscOptions: {
    skipLibCheck: true,
  },
  typedoc: {
    dir: "typedoc",
    name: "Polynomials",
    deploy: false,
  },
  clean: {
    dirs: ["build/lib", "dist/lib"],
  },
};

const test = {
  project,
  name: "test",
  srcDir: "src",
  scripts: ["lib/**/*.ts", "test/**/*.ts"],
  tscOptions: {
    skipLibCheck: true,
  },
  clean: {
    dirs: ["build/test"],
  },
};

const main = {
  project,
  name: "main",
  srcDir: "src",
  scripts: ["lib/**/*.ts", "main/**/*.ts"],
  mainModule: "main/main",
  tscOptions: {
    skipLibCheck: true,
  },
  clean: {
    dirs: ["build/main"],
  },
};

buildTools.registerLibTasks(gulp, lib);
buildTools.registerMochaTasks(gulp, test);
buildTools.registerNodeTasks(gulp, main);

buildTools.projectTasks.registerAll(gulp, project);

gulp.task("all:tsconfig.json", gulp.parallel("lib:tsconfig.json", "test:tsconfig.json"));
gulp.task("all:dist", gulp.parallel("lib:dist"));
