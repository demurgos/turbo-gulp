import * as path from "path";

export const appRoot = __dirname;
export function moduleId(filename: string): string {
  const dirname = path.dirname(filename);
  // drop extension
  const basename = path.basename(filename, ".js");
  const modulePath = path.join(dirname, basename);
  return path.relative(appRoot, modulePath);
}
