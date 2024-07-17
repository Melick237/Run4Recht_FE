import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  activeTab: string = 'home';
  managerEnabled = false;

  constructor(private userService: UserService) {
    const currentPath = window.location.pathname;
    if (currentPath.includes('rangliste')) {
      this.activeTab = 'rangliste';
    } else if (currentPath.includes('statistik')) {
      this.activeTab = 'statistik';
    } else if (currentPath.includes('profil')) {
      this.activeTab = 'profil';
    }
  }

  ngOnInit() {
    this.userService.managerViewEnabled$.subscribe((enabled: any) => {
      this.managerEnabled = enabled;
      this.activeTab = enabled ? 'home-manager' : 'home';
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
