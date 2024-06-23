import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeManagerPage } from './home-manager.page';

const routes: Routes = [
  {
    path: '',
    component: HomeManagerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeManagerPageRoutingModule {}
