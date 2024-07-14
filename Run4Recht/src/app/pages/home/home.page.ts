import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { StepsModalComponent } from '../../steps-modal/steps-modal.component';
import { ApiService } from '../../api.service';
import { StatisticDto, UserDto, TimePeriodDto, TournamentInfoDto, ProfileDto } from '../../models';
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
  competitionDistance: number = 0;
  date1: string = '';
  date2: string = '';
  progress: number = 0;
  stepsLabel: string = '';
  userSubscription: Subscription | undefined;
  profileSubscription: Subscription | undefined;

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private userService: UserService,
    private loadingController: LoadingController // Inject LoadingController
  ) {}

  async openStepsModal() {
    const modal = await this.modalController.create({
      component: StepsModalComponent,
      cssClass: 'alert-modal'
    });

    modal.onDidDismiss().then(() => {
      const user = this.userService.getUser();
      if (user) {
        this.loadTodayStatistics(user);
        this.loadCompetitionStatistics(user);
      }
    });

    return await modal.present();
  }

  ngOnInit() {
    this.setTodayDate();
    this.userSubscription = this.userService.user$.subscribe(user => {
      if (user) {
        this.loadProfile(user);
        this.loadTodayStatistics(user);
        this.loadCompetitionStatistics(user);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  setTodayDate() {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };

    const formattedDate = today.toLocaleDateString('de-DE', options);
    const [weekday, date] = formattedDate.split(', ');

    this.date1 = `${weekday}, der`;
    this.date2 = `${date}`;
  }

  calculateProgress() {
    this.progress = (this.steps / this.totalSteps) * 100;
    this.stepsLabel = `/ ${this.totalSteps.toLocaleString()}`;
  }

  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message,
      duration: 0, // Set duration to 0 to disable auto-hide
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  async loadProfile(user: UserDto) {
    const loading = await this.presentLoading('Loading profile...');
    this.profileSubscription = this.apiService.getProfile(user.id).subscribe(
      (profile: ProfileDto) => {
        this.totalSteps = profile.tagesziel;
        this.calculateProgress();
        loading.dismiss(); // Dismiss the loading spinner
      },
      error => {
        console.error('Error loading profile', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  async loadTodayStatistics(user: UserDto) {
    const loading = await this.presentLoading('Loading today\'s statistics...');
    console.log('Loading statistics for user:', user.id, user.email);

    const today = new Date().toISOString().split('T')[0];

    const timePeriod: TimePeriodDto = {
      von_datum: today,
      bis_datum: today
    };

    this.apiService.getStatisticsWithPeriod(user.id, timePeriod).subscribe(
      (data: StatisticDto[]) => {
        if (data && data.length > 0) {
          this.steps = data[0].schritte;
          this.totalDistance = data[0].strecke;
          this.calculateProgress(); // Recalculate progress with the new data
        }
        loading.dismiss(); // Dismiss the loading spinner
      },
      error => {
        console.error('Error loading statistics', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  async loadCompetitionStatistics(user: UserDto) {
    const loading = await this.presentLoading('Loading competition statistics...');
    this.apiService.getTournamentInfo().subscribe(
      (tournamentInfo: TournamentInfoDto) => {
        const timePeriod: TimePeriodDto = {
          von_datum: new Date(Date.UTC(new Date(tournamentInfo.datum_beginn).getFullYear(), new Date(tournamentInfo.datum_beginn).getMonth(), new Date(tournamentInfo.datum_beginn).getDate())).toISOString().split('T')[0],
          bis_datum: new Date(Date.UTC(new Date(tournamentInfo.datum_ende).getFullYear(), new Date(tournamentInfo.datum_ende).getMonth(), new Date(tournamentInfo.datum_ende).getDate())).toISOString().split('T')[0],
        };

        this.apiService.getStatisticsWithPeriod(user.id, timePeriod).subscribe(
          (data: StatisticDto[]) => {
            if (data && data.length > 0) {
              const totalSteps = data.reduce((sum, stat) => sum + stat.schritte, 0);
              this.competitionDistance = Math.round(data.reduce((sum, stat) => sum + stat.strecke, 0));
              console.log('Total steps for competition:', totalSteps);
              console.log('Total distance for competition:', this.competitionDistance);
            }
            loading.dismiss(); // Dismiss the loading spinner
          },
          error => {
            console.error('Error loading competition statistics', error);
            loading.dismiss(); // Dismiss the loading spinner
          }
        );
      },
      error => {
        console.error('Error loading tournament info', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  async doRefresh(event: any) {
    const user = this.userService.getUser();
    if (user) {
      await this.loadTodayStatistics(user);
      await this.loadCompetitionStatistics(user);
    }
    event.target.complete();
  }
}
