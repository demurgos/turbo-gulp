export interface BuildScriptsOptions {
    production: boolean;
    tscOptions: any;
    baseDir: string;
    sources: string[];
    buildDir: string;
}
export declare function registerTask(gulp: any, targetName: string, options: BuildScriptsOptions): void;
export default registerTask;
