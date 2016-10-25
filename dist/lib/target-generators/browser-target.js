"use strict";
const path = require("path");
const buildTypescript = require("../task-generators/build-typescript");
function generateNodeTasks(gulp, targetName, { project, target, tsc }) {
    const buildDir = path.resolve(project.root, project.buildDir, targetName);
    const srcDir = path.resolve(project.root, project.srcDir, targetName);
    // const distDir: string = path.resolve(project.root, project.distDir);
    const baseDir = path.resolve(srcDir, target.baseDir);
    const sources = [...target.declarations, ...target.scripts];
    const buildTypescriptOptions = {
        tscOptions: tsc,
        baseDir: baseDir,
        sources: sources,
        buildDir: buildDir
    };
    buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);
}
exports.generateNodeTasks = generateNodeTasks;
