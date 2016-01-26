import projectLintTs from './project.lint';
import projectBump from './project.bump';
import projectDistNode from './project.dist.node';

export default function registerTask (gulp, locations, userOptions) {

  projectLintTs(gulp, locations, userOptions);
  projectBump(gulp, locations, userOptions);
  projectDistNode(gulp, locations, userOptions);

  gulp.task('project', ['project.lint']);

};
