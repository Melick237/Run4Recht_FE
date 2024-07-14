import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../../api.service';
import { StatisticDto, TimePeriodDto, TournamentInfoDto, UserDto } from '../../models';
import { UserService } from '../../user.service';
import { Subscription } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-statistik',
  templateUrl: './statistik.page.html',
  styleUrls: ['./statistik.page.scss'],
})
export class StatistikPage implements OnInit, OnDestroy {
  totalSteps: number = 0;
  averageSteps: number = 0;
  statistics: StatisticDto[] = [];
  currentWeek: string = 'Gesamt';
  tournamentStartDate: Date | null = null;
  tournamentEndDate: Date | null = null;
  weekOptions: string[] = ['W1', 'W2', 'W3', 'W4', 'Gesamt'];
  chart: Chart | undefined;
  userSubscription: Subscription | undefined;
  user: UserDto | null = null;
  position: number = 0;
  differenceToFront: number | null = null;
  differenceToBack: number | null = null;

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private loadingController: LoadingController // Inject LoadingController
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.user = user;
      console.log(user)
      if (user) {
        this.fetchTournamentInfo();
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
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
    this.apiService.getTournamentInfo().subscribe(
      (tournamentInfo: TournamentInfoDto) => {
        console.log(tournamentInfo)
        this.tournamentStartDate = new Date(tournamentInfo.datum_beginn);
        this.tournamentEndDate = new Date(tournamentInfo.datum_ende);
        this.currentWeek = this.getCurrentWeek();
        console.log(this.tournamentEndDate.toISOString(), " start  ", this.tournamentStartDate.toISOString())

        this.loadStatistics(this.currentWeek);
        this.loadRankings(); // Load rankings on init
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

  async loadStatistics(week: string) {
    if (!this.user) {
      console.error('User not available');
      return;
    }

    const loading = await this.presentLoading('Loading statistics...');
    let timePeriod: TimePeriodDto;
    let startDate: Date;
    let endDate: Date;

    if (week === 'Gesamt') {
      timePeriod = {
        von_datum: new Date(Date.UTC(this.tournamentStartDate!.getFullYear(), this.tournamentStartDate!.getMonth(), this.tournamentStartDate!.getDate())).toISOString().split('T')[0],
        bis_datum: new Date(Date.UTC(this.tournamentEndDate!.getFullYear(), this.tournamentEndDate!.getMonth(), this.tournamentEndDate!.getDate())).toISOString().split('T')[0],
      };
      startDate = new Date(Date.UTC(this.tournamentStartDate!.getFullYear(), this.tournamentStartDate!.getMonth(), this.tournamentStartDate!.getDate()));
      endDate = new Date(Date.UTC(this.tournamentEndDate!.getFullYear(), this.tournamentEndDate!.getMonth(), this.tournamentEndDate!.getDate()));
    } else {
      const weekNumber = parseInt(week.replace('W', ''), 10) - 1;
      startDate = new Date(Date.UTC(this.tournamentStartDate!.getFullYear(), this.tournamentStartDate!.getMonth(), this.tournamentStartDate!.getDate() + weekNumber * 7));
      endDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6));

      timePeriod = {
        von_datum: startDate.toISOString().split('T')[0],
        bis_datum: endDate.toISOString().split('T')[0]
      };
    }

    this.apiService.getStatisticsWithPeriod(this.user.id, timePeriod).subscribe(
      (data: StatisticDto[]) => {
        this.statistics = this.fillMissingDates(startDate, endDate, data);
        this.calculateTotals();
        this.updateChart();
        loading.dismiss(); // Dismiss the loading spinner
      },
      error => {
        console.error('Error fetching statistics', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  fillMissingDates(startDate: Date, endDate: Date, data: StatisticDto[]): StatisticDto[] {
    const normalizeDate = (datum: any) => {
      if (Array.isArray(datum)) {
        const [year, month, day] = datum;
        return new Date(Date.UTC(year, month - 1, day)).toISOString().split('T')[0];
      }
      return new Date(Date.UTC(new Date(datum).getFullYear(), new Date(datum).getMonth(), new Date(datum).getDate())).toISOString().split('T')[0];
    };

    const filledData: StatisticDto[] = [];
    const dateMap = new Map(data.map(item => [normalizeDate(item.datum), item]));

    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (!dateMap.has(dateStr)) {
        filledData.push({
          id: null,
          mitarbeiter_id: this.user!.id,
          schritte: 0,
          strecke: 0,
          datum: dateStr
        });
      } else {
        filledData.push(dateMap.get(dateStr)!);
      }
    }

    return filledData;
  }

  calculateTotals() {
    if (this.statistics.length > 0) {
      this.totalSteps = this.statistics.reduce((sum, stat) => sum + stat.schritte, 0);
      this.averageSteps = this.totalSteps / this.statistics.length;
    } else {
      this.totalSteps = 0;
      this.averageSteps = 0;
    }
  }

  updateChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const day = date.getUTCDate();
      const month = date.getUTCMonth() + 1; // Months are zero-based
      return `${day}.${month}`; // Format as "day.month"
    };

    const normalizeDate = (datum: any) => {
      if (Array.isArray(datum)) {
        const [year, month, day] = datum;
        return new Date(Date.UTC(year, month - 1, day)).toISOString().split('T')[0];
      }
      return new Date(Date.UTC(new Date(datum).getFullYear(), new Date(datum).getMonth(), new Date(datum).getDate())).toISOString().split('T')[0];
    };

    const uniqueStatistics = Array.from(
      new Map(
        this.statistics.map(stat => [normalizeDate(stat.datum), stat])
      ).values()
    );

    uniqueStatistics.sort((a, b) => new Date(normalizeDate(a.datum)).getTime() - new Date(normalizeDate(b.datum)).getTime());

    const labels = uniqueStatistics.map(stat => formatDate(normalizeDate(stat.datum)));
    const data = uniqueStatistics.map(stat => stat.schritte);

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets![0].data = data;
      this.chart.update();
    } else {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Steps',
            data: data,
            backgroundColor: "#1E612B",
            barThickness: 20,
            borderRadius: 5,
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: false,
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  onSegmentChanged(event: any) {
    this.currentWeek = event.detail.value;
    this.loadStatistics(this.currentWeek);
  }

  async loadRankings() {
    console.log(this.user, "||", this.tournamentStartDate, "||" ,this.tournamentEndDate)
    if (!this.user || !this.tournamentStartDate || !this.tournamentEndDate) {
      console.error('LINE 230 User or tournament dates not available');
      return;
    }

    const loading = await this.presentLoading('Loading rankings...');
    const timePeriod: TimePeriodDto = {
      von_datum: new Date(Date.UTC(this.tournamentStartDate.getFullYear(), this.tournamentStartDate.getMonth(), this.tournamentStartDate.getDate())).toISOString().split('T')[0],
      bis_datum: new Date(Date.UTC(this.tournamentEndDate.getFullYear(), this.tournamentEndDate.getMonth(), this.tournamentEndDate.getDate())).toISOString().split('T')[0],
    };

    this.apiService.getStatisticsGroupByDepartmentWithPeriod(this.user.dienstelle_id, timePeriod).subscribe(
      (statistics: StatisticDto[]) => {
        const sortedStatistics = statistics.sort((a, b) => b.schritte - a.schritte);

        const userIndex = sortedStatistics.findIndex(stat => stat.mitarbeiter_id === this.user!.id);

        if (userIndex > -1) {
          this.position = userIndex + 1;
          if (userIndex > 0) {
            this.differenceToFront = sortedStatistics[userIndex - 1].schritte - sortedStatistics[userIndex].schritte;
          }
          if (userIndex < sortedStatistics.length - 1) {
            this.differenceToBack = sortedStatistics[userIndex].schritte - sortedStatistics[userIndex + 1].schritte;
          }
        }
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
}
