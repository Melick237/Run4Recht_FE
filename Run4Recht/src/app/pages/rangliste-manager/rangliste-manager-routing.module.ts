import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RanglisteManagerPage } from './rangliste-manager.page';

const routes: Routes = [
  {
    path: '',
    component: RanglisteManagerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RanglisteManagerPageRoutingModule {}
