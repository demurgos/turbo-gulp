export interface ProjectOptions {
    root: string;
    "package": string;
    buildDir: string;
    distDir: string;
    srcDir: string;
}
export interface Target {
    /**
     * Type of the target.
     */
    type: "node" | "test" | "browser";
    /**
     * Base directory for the sources of the target, relative to `project.srcDir`.
     */
    baseDir: string;
    /**
     * List of minimatch glob patterns matching the Typescript scripts, relative to `baseDir`.
     */
    scripts: string[];
    /**
     * List of minimatch glob patterns matching the Typescript declarations, relative to `baseDir`.
     */
    declarations: string[];
    /**
     * The name of tha main module (name of the file without the extenstion).
     */
    mainModule?: string;
}
export interface NodeTarget extends Target {
    type: "node";
    mainModule: string;
}
export interface TestTarget extends Target {
    type: "test";
}
export declare const LIB_TARGET: NodeTarget;
export declare const LIB_TEST_TARGET: TestTarget;
export declare const DEFAULT_CONFIG: ProjectOptions;
