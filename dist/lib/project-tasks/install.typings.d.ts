import { ProjectOptions } from "../config/config";
export declare const taskName: string;
export interface Options {
    project: ProjectOptions;
}
export declare function registerTask(gulp: any, {project}: Options): void;
export default registerTask;
