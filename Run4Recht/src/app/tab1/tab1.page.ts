import { Component } from '@angular/core';
import {LocalNotifications} from "@capacitor/local-notifications";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor() {}

  protected readonly LocalNotifications = LocalNotifications;
}
