import {getNextVersion, release} from "../utils/project";
import Locations from "../config/locations";

function bump (type: string, locations: Locations): Promise<any> {
  return getNextVersion(type, locations)
    .then((nextVersion: string) =>{
      return release(nextVersion, locations);
    });
}

export default function registerTask (gulp: any, locations: Locations, userOptions?: any): void {

  gulp.task("project.bump.major", function(){
    bump("major", locations);
  });

  gulp.task("project.bump.minor", function(){
    bump("minor", locations);
  });

  gulp.task("project.bump.patch", function(){
    bump("patch", locations);
  });

};
