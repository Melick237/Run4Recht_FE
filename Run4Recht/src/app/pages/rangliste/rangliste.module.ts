import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RanglistePageRoutingModule } from './rangliste-routing.module';

import { RanglistePage } from './rangliste.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RanglistePageRoutingModule
  ],
  declarations: [RanglistePage]
})
export class RanglistePageModule {}
