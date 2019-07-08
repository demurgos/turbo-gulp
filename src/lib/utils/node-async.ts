/**
 * Helpers to spawn processes and manipulate them as promises.
 *
 * @module utils/node-async
 */

/** (Placeholder comment, see TypeStrong/typedoc#603) */

import childProcess from "child_process";
import fs from "fs";
import { Incident } from "incident";
import stream from "stream";
import util from "util";

export interface ExecFileOptions {
  cwd?: string;
  env?: {[key: string]: string};
  timeout?: number;
  maxBuffer?: number;
  killSignal?: string;
  uid?: number;
  gid?: number;
}

export interface ExecFileResult {
  stdout: Buffer;
  stderr: Buffer;
}

export interface ExecFileErrorData {
  /**
   * Executed command
   */
  cmd: string;

  killed: boolean;

  /**
   * Exit code: 0 if the execution was successful, else there was a runtime error
   */
  code: number;

  // TODO: check the type of `signal`
  signal: null | any;

  stdout: Buffer;

  stderr: Buffer;
}

/**
 * Normalizes the provided argument to a `Buffer`.
 *
 * If it already is a buffer, return it as-is. Otherwise it is a string, build a Buffer from it using UTF-8 encoding.
 *
 * @param val Value to normalize.
 * @return Normalized `Buffer` value.
 */
function asBuffer(val: string | Buffer): Buffer {
  return val instanceof Buffer ? val : Buffer.from(val, "utf8");
}

export class ExecFileError extends Incident<ExecFileErrorData, "ExecFileError", Error> {
  constructor(nativeError: Error, stdout: Buffer | string, stderr: Buffer | string) {
    const data: ExecFileErrorData = {
      cmd: (<Error & {cmd: string}> nativeError).cmd,
      killed: (<Error & {killed: boolean}> nativeError).killed,
      code: (<Error & {code: number}> nativeError).code,
      signal: (<Error & {signal: null | any}> nativeError).signal,
      stdout: asBuffer(stdout),
      stderr: asBuffer(stderr),
    };
    const message: string = `An error occured during the execution of: ${data.cmd}\n${nativeError.stack}`;
    super(nativeError, "ExecFileError", data, message);

  }
}

const _readFile: (filename: string, encoding: string) => Promise<string> = util.promisify(fs.readFile);
const _writeFile: (filename: string, data: any) => Promise<any> = util.promisify(fs.writeFile);

export async function readText(file: string): Promise<string> {
  return _readFile(file, "UTF-8");
}

export async function writeText(file: string, text: string): Promise<void> {
  return _writeFile(file, text);
}

export async function execFile(file: string, args: string[], options?: ExecFileOptions): Promise<ExecFileResult> {
  return new Promise<ExecFileResult>((resolve, reject) => {
    const normalizedOptions: childProcess.ExecFileOptions & {encoding: string} = {...options, encoding: "buffer"};

    childProcess.execFile(
      file,
      args,
      normalizedOptions,
      (error: Error | null, stdout: Buffer | string, stderr: Buffer | string): void => {
        if (error !== null) {
          reject(new ExecFileError(error, stdout, stderr));
          return;
        }
        const result: ExecFileResult = {
          stdout: asBuffer(stdout),
          stderr: asBuffer(stderr),
        };
        resolve(result);
      },
    );
  });
}

export interface SpawnOptions {
  cwd?: string;
  env?: {[key: string]: string};
  stdio?: "inherit" | "pipe";
  /**
   * Run in detached mode. Default: `false`.
   */
  detached?: boolean;
}

export interface SpawnResult {
  /**
   * Buffer containing the whole standard output of the spawned process.
   */
  stdout: Buffer;

  /**
   * Buffer containing the whole standard error of the spawned process.
   */
  stderr: Buffer;

  /**
   * Exit value of the spawned process: a return code or exit signal.
   */
  exit: Exit;
}

/**
 * Exit value of a spawned process: a return code or exit signal
 */
export type Exit = SignalExit | CodeExit;

export interface CodeExit {
  readonly type: "code";
  readonly code: number;
}

export interface SignalExit {
  readonly type: "signal";
  readonly signal: string;
}

export class SpawnedProcess {
  readonly process: childProcess.ChildProcess;

  private readonly stdoutChunks: Buffer[];
  private readonly stderrChunks: Buffer[];
  private exit?: Exit;

  constructor(file: string, args: string[], options: SpawnOptions) {
    this.stdoutChunks = [];
    this.stderrChunks = [];
    this.exit = undefined;

    const detached: boolean = options.detached !== undefined ? options.detached : false;

    this.process = childProcess.spawn(
      file,
      args,
      {stdio: [process.stdin, "pipe", "pipe"], cwd: options.cwd, env: options.env, detached},
    );

    const stdout: stream.Transform = new stream.PassThrough();
    this.process.stdout!.pipe(stdout);
    const stderr: stream.Transform = new stream.PassThrough();
    this.process.stderr!.pipe(stderr);
    if (options.stdio === "inherit") {
      stdout.pipe(process.stdout);
      stderr.pipe(process.stderr);
    }

    stdout.on("data", (chunk: Buffer): void => {
      this.stdoutChunks.push(chunk);
    });
    stderr.on("data", (chunk: Buffer): void => {
      this.stderrChunks.push(chunk);
    });

    this.process.once("exit", (code: number | null, signal: string | null): void => {
      if (code !== null) {
        this.exit = {type: "code", code};
      } else {
        this.exit = {type: "signal", signal: signal!};
      }
    });
  }

  async toPromise(): Promise<SpawnResult> {
    return new Promise<SpawnResult>((resolve: (res: SpawnResult) => void, reject) => {
      if (this.exit !== undefined) {
        const [stdout, stderr]: [Buffer, Buffer] = this.getBuffers();
        resolve({stdout, stderr, exit: this.exit});
      } else {
        this.process.once("error", (err: Error) => {
          this.process.removeAllListeners();
          reject(err);
        });
        this.process.once("exit", (code: number | null, signal: string | null): void => {
          this.process.removeAllListeners();
          let exit: Exit;
          if (code !== null) {
            exit = {type: "code", code};
          } else {
            exit = {type: "signal", signal: signal!};
          }
          const [stdout, stderr]: [Buffer, Buffer] = this.getBuffers();
          resolve({stdout, stderr, exit});
        });
      }
    });
  }

  private getBuffers(): [Buffer, Buffer] {
    const stdout: Buffer = Buffer.concat(this.stdoutChunks);
    const stderr: Buffer = Buffer.concat(this.stderrChunks);
    this.stdoutChunks.length = 0;
    this.stderrChunks.length = 0;
    this.stdoutChunks.push(stdout);
    this.stderrChunks.push(stderr);
    return [stdout, stderr];
  }
}
