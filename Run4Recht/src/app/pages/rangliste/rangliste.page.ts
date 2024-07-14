import { Component, OnInit, OnDestroy } from '@angular/core';
import { RankingDto, TimePeriodDto, TournamentInfoDto, Trend, UserDto } from "../../models";
import { ApiService } from "../../api.service";
import { UserService } from '../../user.service';
import { Subscription } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-rangliste',
  templateUrl: './rangliste.page.html',
  styleUrls: ['./rangliste.page.scss'],
})
export class RanglistePage implements OnInit, OnDestroy {
  selectedItem: number = 3;
  rankings: RankingDto[] = []; // Store rankings data
  Trend = Trend; // Make the enum available in the template
  currentWeek: string = 'Gesamt';
  tournamentStartDate: Date | null = null;
  tournamentEndDate: Date | null = null;
  weekOptions: string[] = ['W1', 'W2', 'W3', 'W4', 'Gesamt'];
  userSubscription: Subscription | undefined;
  tournamentInfoSubscription: Subscription | undefined;
  user: UserDto | null = null;

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private loadingController: LoadingController // Inject LoadingController
  ) { }

  onItemClick(itemNumber: number) {
    this.selectedItem = itemNumber; // Update the selected item
  }

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.user = user;
      this.fetchTournamentInfo();
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.tournamentInfoSubscription) {
      this.tournamentInfoSubscription.unsubscribe();
    }
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

  async fetchTournamentInfo() {
    const loading = await this.presentLoading('Loading tournament info...');
    this.tournamentInfoSubscription = this.apiService.getTournamentInfo().subscribe(
      (tournamentInfo: TournamentInfoDto) => {
        this.tournamentStartDate = new Date(tournamentInfo.datum_beginn);
        this.tournamentEndDate = new Date(tournamentInfo.datum_ende);
        this.currentWeek = 'Gesamt'/*this.getCurrentWeek();*/
        this.loadRankings();
        loading.dismiss(); // Dismiss the loading spinner
      },
      error => {
        console.error('Error fetching tournament info', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  getCurrentWeek(): string {
    if (!this.tournamentStartDate || !this.tournamentEndDate) {
      return 'Gesamt';
    }

    const today = new Date();
    const timeDiff = today.getTime() - this.tournamentStartDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const weekNumber = Math.floor(daysDiff / 7) + 1;

    return weekNumber > 4 ? 'Gesamt' : `W${weekNumber}`;
  }

  async onSegmentChanged(event: any) {
    this.currentWeek = event.detail.value;
    await this.loadRankings();
  }

  async loadRankings() {
    if (!this.tournamentStartDate || !this.tournamentEndDate) {
      console.error('Tournament dates not available');
      return;
    }

    const loading = await this.presentLoading('Loading rankings...');
    let timePeriod: TimePeriodDto;

    if (this.currentWeek === 'Gesamt') {
      timePeriod = {
        von_datum: new Date(Date.UTC(this.tournamentStartDate.getFullYear(), this.tournamentStartDate.getMonth(), this.tournamentStartDate.getDate())).toISOString().split('T')[0],
        bis_datum: new Date(Date.UTC(this.tournamentEndDate.getFullYear(), this.tournamentEndDate.getMonth(), this.tournamentEndDate.getDate())).toISOString().split('T')[0],
      };
    } else {
      const weekNumber = parseInt(this.currentWeek.replace('W', ''), 10) - 1;
      const startDate = new Date(Date.UTC(this.tournamentStartDate.getFullYear(), this.tournamentStartDate.getMonth(), this.tournamentStartDate.getDate() + weekNumber * 7));
      const endDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6));

      timePeriod = {
        von_datum: startDate.toISOString().split('T')[0],
        bis_datum: endDate.toISOString().split('T')[0]
      };
    }

    this.apiService.getRankingsGroupByDepartmentWithPeriod(timePeriod).subscribe(
      (data: RankingDto[]) => {
        this.rankings = data;
        loading.dismiss(); // Dismiss the loading spinner
      },
      error => {
        console.error('Error fetching rankings', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  async doRefresh(event: any) {
    const loading = await this.presentLoading('Refreshing data...');
    await this.fetchTournamentInfo();
    event.target.complete();
    loading.dismiss();
  }

  isUserDepartment(departmentId: number): boolean {
    return this.user ? this.user.dienstelle_id === departmentId : false;
  }
}
