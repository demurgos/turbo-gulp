import { ProjectOptions } from "../config/config";
export declare const taskName: string;
export interface Options {
    project: ProjectOptions;
    tslintOptions: {};
}
export declare function registerTask(gulp: any, {project, tslintOptions}: Options): void;
export default registerTask;
