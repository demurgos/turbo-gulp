/* tslint:disable:no-angle-bracket-type-assertion */

import * as childProcess from "child_process";
import * as fs from "fs";
import {Incident} from "incident";
import Bluebird = require("bluebird");

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

export interface NodeAsync {
  readText(file: string): Promise<string>;
  writeText(file: string, text: string): Promise<void>;
  execFile(file: string, args: string[], options?: ExecFileOptions): Promise<ExecFileResult>;
}

const _readFile: (filename: string, encoding: string) => Bluebird<string> = <any> Bluebird.promisify(fs.readFile);
const _writeFile: (filename: string, data: any) => Bluebird<any> = Bluebird.promisify(fs.writeFile);

export async function readText(file: string): Promise<string> {
  return await _readFile(file, "utf8");
}

export async function writeText(file: string, text: string): Promise<void> {
  return await _writeFile(file, text);
}

export function execFile(file: string, args: string[], options?: ExecFileOptions): Promise<ExecFileResult> {
  return new Promise((resolve, reject) => {
    const normalizedOptions: childProcess.ExecFileOptions & {encoding: string} = <any> {};
    if (options !== undefined) {
      Object.assign(normalizedOptions, options);
    }
    normalizedOptions.encoding = "buffer";

    const child: childProcess.ChildProcess = childProcess.execFile(
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

export default <NodeAsync> {readText, writeText, execFile};
