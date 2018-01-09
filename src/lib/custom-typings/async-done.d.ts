// tslint:disable
declare module "async-done" {
  import { Stream } from "stream";
  import { EventEmitter } from "events";
  import { ChildProcess } from "child_process";

  namespace asyncDone {
    // TODO: Use stricter signature
    type Done<R> = (error?: Error | null, result?: R) => void;

    // TODO: Add rx.js observable
    export type AsyncTask = (done: Done<any>) => any | (() => Stream | EventEmitter | ChildProcess | Promise<any>);
  }

  function asyncDone<R>(fn: asyncDone.AsyncTask, cb: (error: Error | null, result: R) => any): void;

  export = asyncDone;
}
