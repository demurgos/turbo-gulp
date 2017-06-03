import {TaskFunc} from "orchestrator";

export type TaskFunction = TaskFunc & {name?: string, displayName?: string, description?: string} | any;
