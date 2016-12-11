/**
 * Converts a stream to a promise resolved when the stream ends or reject when an error happens.
 * There is no resolved value.
 *
 * @param stream The stream to promisify
 * @returns A promise resolved once the stream ends
 */
export function streamToPromise(stream: NodeJS.ReadableStream): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
    // TODO: See if `stream.resume();` is required:
    // https://github.com/petkaantonov/bluebird/issues/332#issuecomment-229833058
  });
}
