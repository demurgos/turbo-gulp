import {getNextVersion, release} from '../utils/project';

function bump(type, locations){
  return getNextVersion(type, locations)
    .then(function(nextVersion){
      return release(nextVersion, locations);
    });
}

export default function registerTask (gulp, locations, userOptions) {

  gulp.task('project.bump.major', function(){
    bump('major', locations);
  });

  gulp.task('project.bump.minor', function(){
    bump('minor', locations);
  });

  gulp.task('project.bump.patch', function(){
    bump('patch', locations);
  });

};
