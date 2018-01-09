import _asyncDone from "async-done";

export async function asyncDone(fn: _asyncDone.AsyncTask): Promise<any> {
  return new Promise((resolve, reject) => {
    _asyncDone(fn, (err: Error | null | undefined, result: any) => {
      if (err === undefined || err === null) {
        resolve(result);
      } else {
        reject(err);
      }
    });
  });
}
