import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { StepsModalComponent } from '../../steps-modal/steps-modal.component';
import { ApiService } from '../../api.service';
import { StatisticDto, UserDto, TimePeriodDto, TournamentInfoDto, ProfileDto } from '../../models';
import { UserService } from '../../user.service';
import { Subscription } from 'rxjs';
import { HealthService } from '../../health.service';
import { Storage } from '@ionic/storage-angular';

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
  overflowProgress: number = 0;
  stepsLabel: string = '';
  userSubscription: Subscription | undefined;
  profileSubscription: Subscription | undefined;
  stepsToday: number = -1;

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private userService: UserService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private healthService: HealthService,
    private storage: Storage // Inject Storage
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

  async ngOnInit() {
    await this.storage.create();
    this.setTodayDate();
    this.userSubscription = this.userService.user$.subscribe(user => {
      if (user) {
        this.initializeHealth().then(() => {
          this.loadProfile(user);
          this.loadTodayStatistics(user);
          this.loadCompetitionStatistics(user);
        });
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
    this.overflowProgress = this.progress > 100 ? this.progress - 100 : 0;
    this.progress = this.progress > 100 ? 100 : this.progress;
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
      await this.initializeHealth();
      await this.loadTodayStatistics(user);
      await this.loadCompetitionStatistics(user);
    }
    event.target.complete();
  }

  async initializeHealth() {
    console.log('Checking health availability...');
    const available = await this.healthService.isAvailable();
    if (available) {
      console.log('Health is available');
      try {
        await this.healthService.requestAuthorization();
        console.log('Authorization granted');
        await this.getTodaySteps();
      } catch (e) {
        console.log('Error requesting authorization', e);
      }
    } else {
      console.log('Health is not available');
    }
  }

  async getTodaySteps() {
    const lastUploadDate = await this.storage.get('lastUploadDate');
    const lastUploadSteps = await this.storage.get('lastUploadSteps');

    const startDate = lastUploadDate ? new Date(lastUploadDate) : new Date();
    startDate.setHours(0, 0, 0, 0); // Start of the last upload day or today
    const endDate = new Date(); // Current time

    try {
      const steps = await this.healthService.querySteps(startDate, endDate);
      const stepsSinceLastUpload = steps - (lastUploadSteps || 0);
      this.stepsToday = stepsSinceLastUpload > 0 ? stepsSinceLastUpload : steps;
      await this.updateStepsOnServer(stepsSinceLastUpload);
      await this.storage.set('lastUploadDate', endDate.toISOString());
      await this.storage.set('lastUploadSteps', steps);
    } catch (e) {
      console.log('Error querying steps', e);
    }
  }

  async updateStepsOnServer(steps: number) {
    const user = this.userService.getUser();
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const statistic: StatisticDto = {
      id: null,
      mitarbeiter_id: user.id,
      schritte: steps,
      strecke: this.calculateDistance(steps),
      datum: new Date().toISOString().split('T')[0] // Format date as 'YYYY-MM-DD'
    };

    this.apiService.updateStatistic(statistic).subscribe(response => {
      console.log('Steps updated on server', response);
    }, error => {
      console.error('Error updating steps on server', JSON.stringify(error));
    });
  }

  calculateDistance(steps: number): number {
    const averageStepLength = 0.0008; // Average step length in km, adjust if necessary
    return steps * averageStepLength;
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2000
    });
    toast.present();
  }
}
