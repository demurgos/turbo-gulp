/* tslint:disable */

// Fix for server-side resource loading.
// Remove once this PR is on npm:
// https://github.com/angular/universal/pull/596

import * as path from 'path';
import * as fs from 'fs';
import {ResourceLoader} from "@angular/compiler";

const APP_DIR = path.resolve(__dirname, '../app');

export class FileSystemResourceLoader extends ResourceLoader {
  resolve(url: string, baseUrl: string): string {
    //Angular assembles absolute URL's and prefixes them with //
    //if (url.indexOf("/") !== 0) {
      //Resolve relative URL's based on the app root.
      return path.join(baseUrl, url);
    // } else {
    //   return url;
    // }
  }

  get(url: string): Promise<string> {
    const templatePath = this.resolve(url, APP_DIR);
    return new Promise((resolve, reject) => {
      fs.readFile(templatePath, 'utf8', (err: Error, data: string): void => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    });
  }
}
