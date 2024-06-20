import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatistikPageRoutingModule } from './statistik-routing.module';

import { StatistikPage } from './statistik.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatistikPageRoutingModule
  ],
  declarations: [StatistikPage]
})
export class StatistikPageModule {}
