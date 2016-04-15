export interface TargetConfig {
    base: string;
    typescript: string[];
    definitions: string[];
    main?: string;
}
export interface Config {
    project: {
        root: string;
        "package": string;
        "systemjsConfig": string;
        build: string;
        dist: string;
        coverage: string;
        sources: string;
    };
    core: TargetConfig;
    targets: {
        node?: TargetConfig;
        browser?: TargetConfig;
        electron?: TargetConfig;
    };
}
export declare function getDefaultConfig(): Config;
export default class Locations {
    config: Config;
    constructor(config: any);
    getTypescriptSources(targetName: string, excludeSpec?: boolean): string[];
    getSourceDirectory(targetName: string): string;
    getBuildDirectory(targetName: string): string;
    getDistDirectory(targetName: string): string;
    getCoverageDirectory(targetName: string): string;
}
