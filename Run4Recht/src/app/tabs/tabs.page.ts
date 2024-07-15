import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  activeTab: string = 'home'; // Default active tab is 'home'

  constructor() {
    // Detect initial active tab based on the current URL or any other logic
    const currentPath = window.location.pathname;
    if (currentPath.includes('rangliste')) {
      this.activeTab = 'rangliste';
    } else if (currentPath.includes('statistik')) {
      this.activeTab = 'statistik';
    } else if (currentPath.includes('profil')) {
      this.activeTab = 'profil';
    }
  }

  // Function to set the active tab
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}
