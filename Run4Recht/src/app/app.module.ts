import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {TabsPage} from "./tabs/tabs.page";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {StepsModalComponent} from "./steps-modal/steps-modal.component";
import {ApiService} from "./api.service";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [AppComponent, StepsModalComponent, TabsPage],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [ApiService ,{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
