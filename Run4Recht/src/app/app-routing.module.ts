import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';
import { AuthGuard } from './auth.guard';
import { UserService } from './user.service';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'rangliste',
        loadChildren: () => import('./pages/rangliste/rangliste.module').then(m => m.RanglistePageModule)
      },
      {
        path: 'statistik',
        loadChildren: () => import('./pages/statistik/statistik.module').then(m => m.StatistikPageModule)
      },
      {
        path: 'profil',
        loadChildren: () => import('./pages/profil/profil.module').then(m => m.ProfilPageModule)
      },
      {
        path: 'home-manager',
        loadChildren: () => import('./pages/home-manager/home-manager.module').then(m => m.HomeManagerPageModule)
      },
      {
        path: 'rangliste-manager',
        loadChildren: () => import('./pages/rangliste-manager/rangliste-manager.module').then(m => m.RanglisteManagerPageModule)
      }
    ]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(private userService: UserService) {
    this.userService.managerViewEnabled$.subscribe(enabled => {
      this.updateRoutes(enabled);
    });
  }

  updateRoutes(enabled: boolean) {
    const homeRoute = routes[0].children!.find(route => route.path === 'home');
    const ranglisteRoute = routes[0].children!.find(route => route.path === 'rangliste');

    if (homeRoute) {
      homeRoute.loadChildren = () =>
        enabled
          ? import('./pages/home-manager/home-manager.module').then(m => m.HomeManagerPageModule)
          : import('./pages/home/home.module').then(m => m.HomePageModule);
    }

    if (ranglisteRoute) {
      ranglisteRoute.loadChildren = () =>
        enabled
          ? import('./pages/rangliste-manager/rangliste-manager.module').then(m => m.RanglisteManagerPageModule)
          : import('./pages/rangliste/rangliste.module').then(m => m.RanglistePageModule);
    }
  }
}
