import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StepsModalComponent } from '../../steps-modal/steps-modal.component';
import { ApiService } from '../../api.service';
import { StatisticDto, UserDto, TimePeriodDto } from '../../models';
import { UserService } from '../../user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  steps: number = 0;
  totalSteps: number = 10000;
  totalDistance: number = 0;
  date1: string = '';
  date2: string = '';
  progress: number = 0;
  stepsLabel: string = '';
  userSubscription: Subscription | undefined;

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private userService: UserService
  ) {}

  async openStepsModal() {
    const modal = await this.modalController.create({
      component: StepsModalComponent,
      cssClass: 'alert-modal'
    });
    return await modal.present();
  }

  ngOnInit() {
    this.setTodayDate();
    this.calculateProgress();
    this.userSubscription = this.userService.user$.subscribe(user => {
      if (user) {
        this.loadTodayStatistics(user);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  setTodayDate() {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };

    const formattedDate = today.toLocaleDateString('de-DE', options);
    const [weekday, day, month, year] = formattedDate.split(', ');

    this.date1 = `${weekday}, der`;
    this.date2 = `${day}.${month}.${year}`;
  }

  calculateProgress() {
    this.progress = (this.steps / this.totalSteps) * 100;
    this.stepsLabel = `/ ${this.totalSteps.toLocaleString()}`;
  }

  // Method to load today's statistics from the API
  loadTodayStatistics(user: UserDto) {
    console.log('Loading statistics for user:', user.id, user.email);

    const today = new Date().toISOString().split('T')[0];

    const timePeriod: TimePeriodDto = {
      von_datum: today,
      bis_datum: today
    };

    this.apiService.getStatisticsWithPeriod(user.id, timePeriod).subscribe(
      (data: StatisticDto[]) => {
        if (data && data.length > 0) {
          console.log('line 84 Statistics data schritte:', data[0].schritte);
          console.log('line 85 Statistics data schritte:', data[data.length-1].schritte);

          this.steps = data[0].schritte;
          this.totalDistance = data[0].strecke;
          this.calculateProgress(); // Recalculate progress with the new data

/*          const todayStatistic = data.find(stat => stat.datum === today);
          if (todayStatistic) {
            this.steps = todayStatistic.schritte;
            this.totalDistance = todayStatistic.strecke;
            this.calculateProgress(); // Recalculate progress with the new data
          }*/
        }
      },
      error => {
        console.error('line 94 Error loading statistics', error);
      }
    );
  }
}
