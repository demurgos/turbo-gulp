export interface BuildScriptsOptions {
    tscOptions: any;
    baseDir: string;
    sources: string[];
    buildDir: string;
}
export declare function registerTask(gulp: any, targetName: string, options: BuildScriptsOptions): () => any;
export default registerTask;
