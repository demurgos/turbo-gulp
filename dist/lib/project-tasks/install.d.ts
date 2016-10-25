import { ProjectOptions } from "../config/config";
export declare const taskName: string;
export interface Options {
    project: ProjectOptions;
    install: {
        npm: boolean;
        typings: boolean;
    };
}
export declare function registerTask(gulp: any, options: Options): void;
export default registerTask;
