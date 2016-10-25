import { ProjectOptions, NodeTarget } from "../config/config";
export interface Options {
    project: ProjectOptions;
    target: NodeTarget;
    tsc: {
        typescript: any;
    };
}
export declare function generateNodeTasks(gulp: any, targetName: string, {project, target, tsc}: Options): void;
