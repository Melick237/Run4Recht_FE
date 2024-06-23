import { Component, OnInit } from '@angular/core';
import { LocalNotifications } from "@capacitor/local-notifications";
import { Platform } from "@ionic/angular";
import { HealthService } from "./health.service";
import { ApiService } from "./api.service";
import { UserService } from './user.service';
import { StatisticDto, UserDto, Role } from './models';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  stepsToday: number = 0;

  constructor(
/*    private healthService: HealthService,
    private platform: Platform,
    private api: ApiService,
    private userService: UserService*/
  ) {}

  ngOnInit(): void {
/*    this.platform.ready().then(() => {
      this.loginAndInitialize();
    });*/
  }
  /*
  loginAndInitialize() {
    const userDto: UserDto = {
      id: 0,
      name: '',
      email: 'user2_olg@gmail.com',
      role: Role.USER, // Use the Role enum
      dienstelle_id: 0,
    };


        this.api.login(userDto).subscribe(response => {
          console.log('Login successful:', response);
          this.userService.setUser(response);
          this.initializeHealth();
          this.initializePushNotifications();
        }, error => {
          console.error('Login faed:', error);
        });
      }
    /*
      initializePushNotifications() {
        this.scheduleDailyNotification().then(r => console.log("Notification scheduled successfully"));
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

      initializeHealth() {
        console.log('Checking health availability...');
        this.healthService.isAvailable().then((available: boolean) => {
          if (available) {
            console.log('Health is available');
            this.healthService.requestAuthorization()
              .then(() => {
                console.log('Authorization granted');
                this.getTodaySteps();
              })
              .catch(e => console.log('Error requesting authorization', e));
          } else {
            console.log('Health is not available');
          }
        }).catch(e => console.log('Error checking health availability', e));
      }

      getTodaySteps() {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0); // Start of today
        const endDate = new Date(); // Current time

        this.healthService.querySteps(startDate, endDate).then(steps => {
          this.stepsToday = steps;
          this.updateStepsOnServer(steps);
        }).catch(e => console.log('Error querying steps', e));
      }

      updateStepsOnServer(steps: number) {
        const user = this.userService.getUser();
        if (!user) {
          console.error('User not logged in');
          return;
        }

        const statistic: StatisticDto = {
          id:null,
          mitarbeiter_id: user.id,
          schritte: steps,
          strecke: this.calculateDistance(steps), // Add a method to calculate distance if needed
          datum: new Date().toISOString().split('T')[0] // Format date as 'YYYY-MM-DD'
        };

        this.api.updateStatistic(statistic).subscribe(response => {
          console.log('Steps updated on server', response);
        }, error => {
          console.error('Error updating steps on server', error);
        });
      }

      calculateDistance(steps: number): number {
        const averageStepLength = 0.0008; // Average step length in km, adjust if necessary
        return steps * averageStepLength;
      }*/
}
