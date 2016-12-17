/* tslint:disable */

import {NgModule} from '@angular/core';

import {HomeModule} from './home/home.module';
import {AppRoutingModule} from './app-routing.module';

import {AppComponent} from './app.component';

@NgModule({
	declarations: [AppComponent],
	imports: [
		HomeModule,
		AppRoutingModule
	],
	exports: [
		HomeModule,
		AppRoutingModule
	]
})
export class AppModule {}
