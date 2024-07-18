import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../../api.service';
import { UserService } from '../../user.service';
import { StatisticDto, UserDto, TimePeriodDto, TournamentInfoDto } from '../../models';
import { LoadingController, ModalController } from '@ionic/angular';
import { Utils } from 'src/app/utils/Utils';
import { StepsModalComponent } from '../../steps-modal/steps-modal.component';

@Component({
  selector: 'app-home-manager',
  templateUrl: './home-manager.page.html',
  styleUrls: ['./home-manager.page.scss'],
})
export class HomeManagerPage implements OnInit, OnDestroy {
  rankings: StatisticDto[] = [];
  userSubscription: Subscription | undefined;
  user: UserDto | null = null;
  isLoading: boolean = false;
  tournamentStartDate: Date | null = null;
  tournamentEndDate: Date | null = null;
  filter: 'tournament' | 'today' = 'tournament';

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.fetchTournamentInfo().then(() => {
          this.loadRankings();
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message,
      duration: 0,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  async fetchTournamentInfo() {
    const loading = await this.presentLoading('Lade Turnierinformationen...');
    return new Promise<void>((resolve, reject) => {
      this.apiService.getTournamentInfo().subscribe(
        (tournamentInfo: TournamentInfoDto) => {
          this.tournamentStartDate = new Date(Utils.normalizeDate(tournamentInfo.datum_beginn));
          this.tournamentEndDate = new Date(Utils.normalizeDate(tournamentInfo.datum_ende));
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

  async loadRankings() {
    if (!this.user || !this.tournamentStartDate || !this.tournamentEndDate) {
      console.error('Benutzer oder Turnierdaten nicht verfügbar');
      return;
    }

    const loading = await this.presentLoading('Lade Ranglisten...');
    this.isLoading = true;

    let timePeriod: TimePeriodDto;
    if (this.filter === 'tournament') {
      timePeriod = {
        von_datum: Utils.normalizeDate(this.tournamentStartDate),
        bis_datum: new Date(Date.now()).toISOString().split('T')[0], // Set bis_datum to today's date
      };
    } else {
      const today = new Date().toISOString().split('T')[0];
      timePeriod = {
        von_datum: today,
        bis_datum: today
      };
    }
    //this.apiService.getStatisticsGroupByDepartmentWithPeriodAll(this.user.dienstelle_id, timePeriod).subscribe(
    this.apiService.getStatisticsGroupByDepartmentWithPeriod(this.user.dienstelle_id, timePeriod).subscribe(
      (statistics: StatisticDto[]) => {
        this.rankings = statistics.sort((a, b) => b.schritte - a.schritte);
        this.isLoading = false;
        loading.dismiss();
      },
      error => {
        console.error('Fehler beim Laden der Ranglisten', error);
        this.isLoading = false;
        loading.dismiss();
      }
    );
  }

  toggleFilter() {
    this.filter = this.filter === 'tournament' ? 'today' : 'tournament';
    this.loadRankings();
  }

  async openStepsModal(userId: number) {
    const modal = await this.modalController.create({
      component: StepsModalComponent,
      cssClass: 'alert-modal',
      componentProps: { userId }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadRankings(); // Refresh rankings if data was saved
      }
    });

    return await modal.present();
  }
}
