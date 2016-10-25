import {bumpVersion} from "../utils/project";
import Locations from "../config/config";

export const taskName = "project:bump-minor";

export function registerTask (gulp: any, locations: Locations, userOptions?: any): void {
  gulp.task(taskName, function(){
    bumpVersion("minor", locations);
  });
}

export default registerTask;
