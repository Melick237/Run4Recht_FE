import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { StepsModalComponent } from '../../steps-modal/steps-modal.component';
import { ApiService } from '../../api.service';
import { StatisticDto, UserDto, TimePeriodDto, TournamentInfoDto, ProfileDto } from '../../models';
import { UserService } from '../../user.service';
import { Subscription } from 'rxjs';
import { HealthService } from '../../health.service';
import { Storage } from '@ionic/storage-angular';
import { Utils } from 'src/app/utils/Utils';

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
  tournamentStartDate: string = '';
  tournamentEndDate: string = '';

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
          this.loadTournamentData().then(() => {
            this.loadCompetitionStatistics(user);
          });
        });
      }
    });
  }

  ionViewWillEnter() {
    const user = this.userService.getUser();
    if (user) {
      this.loadProfile(user);
      this.loadTodayStatistics(user);
      this.loadCompetitionStatistics(user);
    }
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

  isGoalReached(): boolean {
    const stepsGoal = parseInt(this.stepsLabel.replace(/[^0-9]/g, ''), 10);
    return this.steps >= stepsGoal;
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
    const loading = await this.presentLoading('Profil wird geladen...');
    this.profileSubscription = this.apiService.getProfile(user.id).subscribe(
      (profile: ProfileDto) => {
        this.totalSteps = profile.tagesziel;
        this.calculateProgress();
        loading.dismiss(); // Dismiss the loading spinner
      },
      error => {
        console.error('Fehler beim Laden des Profils', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  async loadTodayStatistics(user: UserDto) {
    const loading = await this.presentLoading('Heutige Statistiken werden geladen...');
    console.log('Lade Statistiken für Benutzer:', user.id, user.email);

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
        console.error('Fehler beim Laden der Statistiken', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  async loadTournamentData() {
    const loading = await this.presentLoading('Turnierinformationen werden geladen...');
    return new Promise<void>((resolve, reject) => {
      this.apiService.getTournamentInfo().subscribe(
        (tournamentInfo: TournamentInfoDto) => {
          this.tournamentStartDate = Utils.normalizeDate(tournamentInfo.datum_beginn);
          this.tournamentEndDate = Utils.normalizeDate(tournamentInfo.datum_ende);
          loading.dismiss();
          resolve();
        },
        error => {
          console.error('Fehler beim Laden der Turnierinformationen', error);
          loading.dismiss();
          reject(error);
        }
      );
    });
  }

  async loadCompetitionStatistics(user: UserDto) {
    const loading = await this.presentLoading('Wettbewerbsstatistiken werden geladen...');
    const timePeriod: TimePeriodDto = {
      von_datum: this.tournamentStartDate,
      bis_datum: new Date().toISOString().split('T')[0]
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
        console.error('Fehler beim Laden der Wettbewerbsstatistiken', error);
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
    console.log('Überprüfen der Gesundheitsverfügbarkeit...');
    const available = await this.healthService.isAvailable();
    if (available) {
      console.log('Gesundheitsdaten sind verfügbar');
      try {
        await this.healthService.requestAuthorization();
        console.log('Genehmigung erteilt');
        await this.getTodaySteps();
      } catch (e) {
        console.log('Fehler bei der Anforderung der Genehmigung', e);
      }
    } else {
      console.log('Gesundheitsdaten sind nicht verfügbar');
    }
  }

  async getTodaySteps() {
    let lastUploadDate = await this.storage.get('lastUploadDate');

    if (!lastUploadDate) {
      lastUploadDate = this.tournamentStartDate;
    }
    const lastUploadSteps = await this.storage.get('lastUploadSteps');
    const startDate = new Date(lastUploadDate);
    const endDate = new Date(); // Current time
    startDate.setHours(0, 0, 0, 0); // Start of the last upload day or today

    try {
      const stepsData: { date: string; steps: number }[] = await this.healthService.queryStepsWithDate(startDate, endDate);

      for (let i = 0; i < stepsData.length; i++) {
        const { date, steps } = stepsData[i];
        const stepsSinceLastUpload = steps - (lastUploadSteps || 0);
        console.log( 'start ' ,startDate.toISOString(), "   end  ", endDate.toISOString())

        console.log( 'total ' ,stepsSinceLastUpload, "   steps ", steps,   "  last upload ", lastUploadSteps)

        const statistic: StatisticDto = {
          id: null,
          mitarbeiter_id: this.userService.getUser()!.id,
          schritte: stepsSinceLastUpload >= 0 ? stepsSinceLastUpload : steps,
          strecke: this.calculateDistance(stepsSinceLastUpload > 0 ? stepsSinceLastUpload : steps),
          datum: date // Use the date for this statistic
        };

        await this.uploadStatistic(statistic);
      }

      await this.storage.set('lastUploadDate', endDate.toISOString());
      await this.storage.set('lastUploadSteps', stepsData[stepsData.length - 1].steps);
    } catch (e) {
      console.log('Fehler bei der Abfrage der Schritte', e);
    }
  }

  async uploadStatistic(statistic: StatisticDto) {
    return new Promise<void>((resolve, reject) => {
      this.apiService.updateStatistic(statistic).subscribe(response => {
        console.log('Schritte erfolgreich auf dem Server aktualisiert', response);
        resolve();
      }, error => {
        console.error('Fehler beim Aktualisieren der Schritte auf dem Server', JSON.stringify(error));
        reject(error);
      });
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
