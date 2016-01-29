declare module 'gulp-mocha'{
    interface StaticMocha{
        (options?: any): any;
    }
    let staticMocha: StaticMocha;
    export = staticMocha;
}

declare module "gulp-typescript"{
    interface StaticGulpTypescript{
        (tsConfig: any): any;
    }
    let staticGulpTypescript: StaticGulpTypescript;
    export = staticGulpTypescript;
}

declare module "merge2"{
    interface StaticMerge2{
        (streams: any[]): any;
    }
    let staticMerge2: StaticMerge2;
    export = staticMerge2;
}

declare module 'typings'{
    export function install(options?: any): any;
}

declare module "gulp-install"{
    interface StaticGulpInstall{
        (): any;
    }
    let staticGulpInstall: StaticGulpInstall;
    export = staticGulpInstall;
}

declare module "systemjs-builder"{
    interface StaticBuilder{
        new (projectRoot: string, systemjsConfigPath: string): Builder;
    }

    interface Builder{
        build(entryPointPath: string, ouputFile: string): any;
    }

    let systemjsBuilder:StaticBuilder;

    export = systemjsBuilder;
}

declare module 'jspm'{
    interface StaticJspm{
        setPackagePath(path: string): any;
        install(fromPackage: boolean): any;
    }
    let staticJspm: StaticJspm;
    export = staticJspm;
}

declare module "gulp-tslint"{
    interface StaticGulpTsLint{
        report(reporterName: string): any;
        (options?: any): any;
    }
    let staticGulpTsLint: StaticGulpTsLint;
    export = staticGulpTsLint;
}
