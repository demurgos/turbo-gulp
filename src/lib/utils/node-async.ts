import {
  ChildProcess,
  execFile as _execFile,
  ExecFileOptions as _ExecFileOptions,
  spawn as _spawn,
} from "child_process";
import * as fs from "fs";
import { Incident } from "incident";
import { PassThrough, Transform as TransformStream } from "stream";
import { promisify } from "util";

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

function asBuffer(val: string | Buffer): Buffer {
  return val instanceof Buffer ? val : new Buffer(val, "utf8");
}

export class ExecFileError extends Incident<"ExecFileError", ExecFileErrorData, Error> {
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

const _readFile: (filename: string, encoding: string) => Promise<string> = <any> promisify(fs.readFile);
const _writeFile: (filename: string, data: any) => Promise<any> = <any> promisify(fs.writeFile);

export async function readText(file: string): Promise<string> {
  return await _readFile(file, "utf8");
}

export async function writeText(file: string, text: string): Promise<void> {
  return await _writeFile(file, text);
}

export async function execFile(file: string, args: string[], options?: ExecFileOptions): Promise<ExecFileResult> {
  return new Promise<ExecFileResult>((resolve, reject) => {
    const normalizedOptions: _ExecFileOptions & {encoding: string} = {...options, encoding: "buffer"};

    _execFile(
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
  stdout: Buffer;
  stderr: Buffer;
  exit: Exit;
}

export type Exit = SignalExit | CodeExit;

export interface CodeExit {
  type: "code";
  code: number;
}

export interface SignalExit {
  type: "signal";
  signal: string;
}

export class SpawnedProcess {
  readonly process: ChildProcess;

  private readonly stdoutChunks: Buffer[];
  private readonly stderrChunks: Buffer[];
  private exit?: Exit;

  constructor(file: string, args: string[], options: SpawnOptions) {
    this.stdoutChunks = [];
    this.stderrChunks = [];
    this.exit = undefined;

    const detached: boolean = options.detached !== undefined ? options.detached : false;

    this.process = _spawn(
      file,
      args,
      {stdio: [process.stdin, "pipe", "pipe"], cwd: options.cwd, env: options.env, detached},
    );

    const stdout: TransformStream = new PassThrough();
    this.process.stdout.pipe(stdout);
    const stderr: TransformStream = new PassThrough();
    this.process.stderr.pipe(stderr);
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
        this.process.once("exit", (code: number | null, signal: string | null): void => {
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
