import {bumpVersion} from "../utils/project";
import Locations from "../config/config";

export const taskName = "project:bump-major";

export function registerTask (gulp: any, locations: Locations, userOptions?: any): void {
  gulp.task(taskName, function(){
    bumpVersion("major", locations);
  });
}

export default registerTask;
