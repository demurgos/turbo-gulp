import {Gulp} from "gulp";
import {Project} from "../project";

/**
 * Represents a Typescript library.
 * This is compatible both with browsers and node.
 */
export interface LibTarget {

}

/**
 * Generates and registers gulp tasks for the provided lib target.
 *
 * @param gulp Gulp instance to use to register the tasks.
 * @param project Project configuration.
 * @param target Target configuration.
 */
export function registerLibTargetTasks(gulp: Gulp, project: Project, target: LibTarget): void {

}
