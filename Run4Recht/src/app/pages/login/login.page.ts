import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../../api.service';
import { UserService } from '../../user.service';
import {UserDto, Role, StatisticDto} from '../../models';
import { Storage } from '@ionic/storage-angular';
import { NotificationService } from '../../notification.service';
import {HealthService} from "../../health.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  stepsToday: number = 0;

  constructor(
    private navCtrl: NavController,
    private apiService: ApiService,
    private userService: UserService,
    private storage: Storage,
    private notificationService: NotificationService, // Inject the NotificationService
    private healthService: HealthService
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const storedEmail = await this.storage.get('email');
    if (storedEmail) {
      this.email = storedEmail;
      this.login();
    }
  }

  async onSubmit() {
    if (this.email) {
      await this.storage.set('email', this.email);
      this.login();
    } else {
      console.log('Veuillez entrer une adresse e-mail valide.');
    }
  }

  private login() {
    const userDto: UserDto = {
      id: 0, // Placeholder ID, adjust as necessary
      name: '', // Placeholder name, adjust as necessary
      email: this.email,
      role: Role.USER, // Use the Role enum
      dienstelle_id: 0, // Placeholder department ID, adjust as necessary
    };

    this.apiService.login(userDto).subscribe((response: any) => {
      console.log('Login successful:', response);
      this.userService.setUser(response);
      this.scheduleNotifications(); // Schedule notifications after login
      this.initializeHealth();
      this.navCtrl.navigateForward('/tabs/home'); // Navigate to the home page
    }, (error: any) => {
      console.error('Login failed:', error);
    });
  }

  private scheduleNotifications() {
    this.notificationService.scheduleDailyReminder();
    this.notificationService.scheduleTestNotification();
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

    this.apiService.updateStatistic(statistic).subscribe(response => {
      console.log('Steps updated on server', response);
    }, error => {
      console.error('Error updating steps on server', error);
    });
  }

  calculateDistance(steps: number): number {
    const averageStepLength = 0.0008; // Average step length in km, adjust if necessary
    return steps * averageStepLength;
  }
}
