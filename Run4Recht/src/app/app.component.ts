import {Component, OnInit} from '@angular/core';
import {LocalNotifications} from "@capacitor/local-notifications";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor() {

  }

  ngOnInit(): void {
    this.initializePushNotifications();
  }

  initializePushNotifications() {

    this.scheduleDailyNotification();
  }

  async scheduleDailyNotification() {
    const notificationTime = new Date();
    notificationTime.setHours(21, 0, 0, 0); // Set time to 9 PM

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Daily Sync Reminder",
          body: "Don't forget to sync your data!",
          id: 1,
          schedule: {
            repeats: true,
            every: 'day',
            at: notificationTime
          },
          actionTypeId: "",
          extra: null
        }
      ]
    });
  }
}
