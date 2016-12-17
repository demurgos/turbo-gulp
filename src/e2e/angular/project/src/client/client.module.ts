import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {UniversalModule, isBrowser, isNode} from 'angular2-universal/browser'; // for AoT we need to manually split universal packages

import {AppComponent} from '../app/app.component';
import {AppRoutingModule} from '../app/app-routing.module';
import {AppModule} from "../app/app.module";

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    UniversalModule, // BrowserModule, HttpModule, and JsonpModule are included
    FormsModule,

	  AppModule,
    AppRoutingModule
  ],
  providers: [
    {provide: 'isBrowser', useValue: isBrowser},
    {provide: 'isNode', useValue: isNode}
  ]
})
export class ClientModule {}
