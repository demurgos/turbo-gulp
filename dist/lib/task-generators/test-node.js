// import * as path from "path";
// import * as mocha from "gulp-mocha";
//
// import * as buildNodeTest from "./build.node-test";
// import Locations from "../config/config";
//
// export const taskName = "test:node";
//
// export function registerTask (gulp: any, locations: Locations, userOptions?: any) {
//   buildNodeTest.registerTask(gulp, locations, userOptions || {});
//
//   gulp.task(taskName, [buildNodeTest.taskName], function(){
//     return gulp
//       .src([path.join(locations.getCoverageDirectory("node"), "**/*.spec.js")], { base: locations.getCoverageDirectory("node")})
//       .pipe(mocha({
//         reporter: "spec"
//       }));
//   });
// }
//
// export default registerTask;
