import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../pages/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'home-manager',
        loadChildren: () => import('../pages/home-manager/home-manager.module').then(m => m.HomeManagerPageModule)
      },
      {
        path: 'rangliste',
        loadChildren: () => import('../pages/rangliste/rangliste.module').then(m => m.RanglistePageModule)
      },
      {
        path: 'statistik',
        loadChildren: () => import('../pages/statistik/statistik.module').then(m => m.StatistikPageModule)
      },
      {
        path: 'profil',
        loadChildren: () => import('../pages/profil/profil.module').then(m => m.ProfilPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
