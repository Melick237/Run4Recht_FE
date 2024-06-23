import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RanglisteManagerPageRoutingModule } from './rangliste-manager-routing.module';

import { RanglisteManagerPage } from './rangliste-manager.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RanglisteManagerPageRoutingModule
  ],
  declarations: [RanglisteManagerPage]
})
export class RanglisteManagerPageModule {}
