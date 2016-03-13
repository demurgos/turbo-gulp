import configLocations from "../core/config/locations";
export declare var config: {
    Locations: typeof configLocations;
};
export declare var tasks: {
    build: (gulp: any, locations: configLocations, userOptions?: any) => void;
    install: (gulp: any, locations: configLocations, userOptions?: any) => void;
    project: (gulp: any, locations: configLocations, userOptions?: any) => void;
    test: (gulp: any, locations: configLocations, options?: any) => void;
};
