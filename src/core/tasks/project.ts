import projectLintTs from './project.lint';
import projectBump from './project.bump';
import projectDistNode from './project.dist.node';
import Locations from "../config/locations";

export default function registerTask (gulp:any, locations: Locations, userOptions?: any) {

  projectLintTs(gulp, locations, userOptions);
  projectBump(gulp, locations, userOptions);
  projectDistNode(gulp, locations, userOptions);

  gulp.task('project', ['project.lint']);

};
