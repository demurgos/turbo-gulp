"use strict";
const path = require("path");
const del = require("del");
const buildTypescript = require("../task-generators/build-typescript");
function generateTarget(gulp, targetName, { project, target, tsc }) {
    const buildDir = path.resolve(project.root, project.buildDir, targetName);
    const srcDir = path.resolve(project.root, project.srcDir);
    // const distDir: string = path.resolve(project.root, project.distDir, targetName);
    const baseDir = path.resolve(srcDir, target.baseDir);
    const sources = [...target.declarations, ...target.scripts];
    const buildTypescriptOptions = {
        tscOptions: tsc,
        baseDir: baseDir,
        sources: sources,
        buildDir: buildDir
    };
    buildTypescript.registerTask(gulp, targetName, buildTypescriptOptions);
    gulp.task(`clean:${targetName}`, function () {
        return del(buildDir);
    });
}
exports.generateTarget = generateTarget;
