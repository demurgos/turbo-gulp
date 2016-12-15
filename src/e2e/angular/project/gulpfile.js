// Sample gulpfile
const gulp = require("gulp");
const typescript = require("typescript");
const buildTools = require("./local-web-build-tools");

const projectOptions = buildTools.config.DEFAULT_PROJECT_OPTIONS;
projectOptions.root = __dirname;

buildTools.projectTasks.registerAll(gulp, {
  project: projectOptions,
  tslintOptions: {},
  install: {}
});


const serverTarget = {
  type: "node",
  baseDir: "server",
  scripts: ["server/**/*.ts", "app/**/*.ts"],
  typeRoots: ["./custom-typings", "../typings/globals", "../typings/modules", "../node_modules/@types"],
  mainModule: "server/main",
};

buildTools.targetGenerators.node.generateTarget(
  gulp,
  "server",
  {
    project: projectOptions,
    target: serverTarget,
    tsOptions: {
      skipLibCheck: true,
      typescript: typescript,
      lib: ["es6", "dom"]
    },
    pug: [
      {
        // Name of the gulp sub-task
        name: "app",
        // Files to process
        files: ["app/**/*.pug"],
        // gulp-pug options
        options: {locals: {locale: "en_US"}}
      }
    ],
    sass: [
      {
        // Name of the gulp sub-task
        name: "app",
        // Files to process
        files: ["app/**/*.scss"]
      }
    ]
  }
);
