/* tslint:disable */

import 'angular2-universal-polyfills';

import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import {IRouterHandler, IRouter} from "express-serve-static-core";
import {enableProdMode} from '@angular/core';
import {FileSystemResourceLoader} from './node-polyfill';
import {ResourceLoader} from '@angular/compiler';
import {platformNodeDynamic} from 'angular2-universal/node';
import {createEngine} from 'angular2-express-engine';
import {AppServerModule} from './server.module';
import {root} from './config';
import mainRouter from './routes';

// Enable Angular's prod for faster renders
enableProdMode();

// Create the server's app
const app = express();

// Create the express engine for the Angular app
app.engine('.html', createEngine({
  // Fix server-side resource-loading, see ./node-polyfill.ts
  // See https://github.com/angular/universal/issues/579
  platform: (extraProviders: any) => {
    const platform = platformNodeDynamic(extraProviders);
    (<any> platform).cacheModuleFactory_old = platform.cacheModuleFactory;

    platform.cacheModuleFactory = (moduleType: any, compilerOptions?: any): Promise<any> => {
      if (!compilerOptions) {
        compilerOptions = {
          providers: [
            {provide: ResourceLoader, useClass: FileSystemResourceLoader}
          ]
        }
      }
      return (<any> platform).cacheModuleFactory_old(moduleType, compilerOptions);
    };
    return platform;
  },
  precompile: true,
  ngModule: AppServerModule
}));

// Set app variables
app.set('views', path.join(root, "app"));
app.set('view engine', 'html');

// Configure the server to parse body
app.use(cookieParser('Secret key'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Configure routes
app.use(mainRouter);

// Instantiate the server
let server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});
