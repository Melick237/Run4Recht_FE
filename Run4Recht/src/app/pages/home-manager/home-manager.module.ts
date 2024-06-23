import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeManagerPageRoutingModule } from './home-manager-routing.module';

import { HomeManagerPage } from './home-manager.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeManagerPageRoutingModule
  ],
  declarations: [HomeManagerPage]
})
export class HomeManagerPageModule {}
