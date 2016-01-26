var project = require('./project');

function bump(type, locations){
  return project
    .getNextVersion(type, locations)
    .then(function(nextVersion){
      return project.release(nextVersion, locations);
    });
}

module.exports = function (gulp, locations, userOptions) {

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
