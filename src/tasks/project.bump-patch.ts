import {bumpVersion} from "../utils/project";
import Locations from "../config/locations";

export const taskName = "project:bump-patch";

export function registerTask (gulp: any, locations: Locations, userOptions?: any): void {
  gulp.task(taskName, function(){
    bumpVersion("patch", locations);
  });
}

export default registerTask;
