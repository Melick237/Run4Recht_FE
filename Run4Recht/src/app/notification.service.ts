import { Injectable } from '@angular/core';
import {LocalNotificationPendingList, LocalNotifications} from '@capacitor/local-notifications';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {
    this.checkPermission();
  }

  async checkPermission() {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display === 'granted') {
      console.log('Notification permission granted.');
      this.scheduleDailyReminder();
      this.scheduleTestNotification();
    } else {
      console.log('Notification permission denied.');
      this.requestPermission();
    }
  }

  async requestPermission() {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      // Open app settings for notifications
      await LocalNotifications.requestPermissions();
    }
  }

  async scheduleDailyReminder() {
    const notifications = await LocalNotifications.schedule({
      notifications: [
        {
          title: "Daily Steps Reminder",
          body: "Don't forget to update your steps!",
          id: 1,
          schedule: {
            on: {
              hour: 20,
              minute: 0,
            },
            repeats: true
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: "",
          extra: null
        }
      ]
    });
    console.log('Scheduled daily reminder:', notifications);
  }

  async scheduleTestNotification() {
    const notification = await LocalNotifications.schedule({
      notifications: [
        {
          title: "Test Notification",
          body: "This is a test notification.",
          id: 2,
          schedule: {
            at: new Date(Date.now() + 10000) // 10 seconds from now
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: "",
          extra: null
        }
      ]
    });
    console.log('Scheduled test notification:', notification);
  }

  async getPendingNotifications(): Promise<LocalNotificationPendingList> {
    return await LocalNotifications.getPending();
  }

  async cancelNotification(notificationId: number) {
    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }]
    });
  }
}
