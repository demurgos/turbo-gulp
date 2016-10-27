declare module "gulp-util" {
  export class PluginError extends Error {
    constructor(pluginName: string, message: Error, options?: any);
  }
  export function log(...args: any[]): any;
}
