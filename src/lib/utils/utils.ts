/**
 * Converts a stream to a promise resolved when the stream ends or reject when an error happens.
 * There is no resolved value.
 *
 * @param stream The stream to promisify
 * @returns A promise resolved once the stream ends
 */
export async function streamToPromise(stream: NodeJS.ReadableStream): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
    // TODO: See if `stream.resume();` is required:
    // See: https://github.com/petkaantonov/bluebird/issues/332#issuecomment-229833058
  });
}

export function deleteUndefinedProperties(obj: any): void {
  for (const key in obj) {
    if (obj[key] ===  undefined) {
      delete obj[key];
    }
  }
}
