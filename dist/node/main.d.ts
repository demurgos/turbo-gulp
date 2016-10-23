import configLocations from "./config/locations";
export declare const config: {
    Locations: typeof configLocations;
};
export declare const tasks: {
    build: (gulp: any, locations: configLocations, userOptions?: any) => void;
    clean: (gulp: any, locations: any, options?: any) => void;
    install: (gulp: any, locations: configLocations, userOptions?: any) => void;
    project: (gulp: any, locations: configLocations, userOptions?: any) => void;
    test: (gulp: any, locations: configLocations, options?: any) => void;
};
