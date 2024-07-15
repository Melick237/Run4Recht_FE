import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  activeTab: string = 'home'; // Set the default active tab

  constructor() {}

  // Function to set the active tab
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}
