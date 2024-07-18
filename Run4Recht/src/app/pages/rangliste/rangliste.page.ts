import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { RankingDto, TimePeriodDto, TournamentInfoDto, Trend, UserDto } from "../../models";
import { ApiService } from "../../api.service";
import { UserService } from '../../user.service';
import { Subscription } from 'rxjs';
import { LoadingController, IonContent } from '@ionic/angular';
import { Utils } from 'src/app/utils/Utils';
import {time} from "ionicons/icons";

@Component({
  selector: 'app-rangliste',
  templateUrl: './rangliste.page.html',
  styleUrls: ['./rangliste.page.scss'],
})
export class RanglistePage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('rankingItem') rankingItems!: QueryList<ElementRef>;
  @ViewChild('content', { static: false }) content!: IonContent;

  selectedItem: number = 3;
  rankings: RankingDto[] = []; // Store rankings data
  Trend = Trend; // Make the enum available in the template
  currentWeek: string = 'Gesamt';
  tournamentStartDate: Date | null = null;
  tournamentEndDate: Date | null = null;
  weekOptions: string[] = []; // Store available weeks
  userSubscription: Subscription | undefined;
  tournamentInfoSubscription: Subscription | undefined;
  user: UserDto | null = null;
  viewUpdated: boolean = false;
  showScrollButton: boolean = false;
  userScrolled: boolean = false;
  isLoading: boolean = false;

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private loadingController: LoadingController // Inject LoadingController
  ) { }

  onItemClick(itemNumber: number) {
    this.selectedItem = itemNumber; // Update the selected item
  }

  loadData(segmentValue: string) {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  ngOnInit() {
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.user = user;
      this.fetchTournamentInfo();
    });
  }

  ionViewWillEnter() {
    this.loadRankings(); // Ensure rankings are reloaded when the tab is entered
  }

  ngAfterViewInit() {
    this.checkInitialVisibility();
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
        this.tournamentStartDate = new Date(Utils.normalizeDate(tournamentInfo.datum_beginn));
        this.tournamentEndDate = new Date(Utils.normalizeDate(tournamentInfo.datum_ende));
        this.updateWeekOptions(); // Update available weeks based on the current date
        this.currentWeek = 'Gesamt';
        this.loadRankings();
        loading.dismiss(); // Dismiss the loading spinner
      },
      error => {
        console.error('Error fetching tournament info', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  updateWeekOptions() {
    if (!this.tournamentStartDate || !this.tournamentEndDate) {
      this.weekOptions = ['Gesamt'];
      return;
    }

    const today = new Date();
    const timeDiff = today.getTime() - this.tournamentStartDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const currentWeek = Math.floor(daysDiff / 7) + 1;

    this.weekOptions = [];
    for (let i = 1; i <= currentWeek; i++) {
      this.weekOptions.push(`W${i}`);
    }
    this.weekOptions.push('Gesamt');
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
        bis_datum: new Date(Date.now()).toISOString().split('T')[0], // Set bis_datum to today's date
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

    console.log(timePeriod.von_datum ,"     ", timePeriod.bis_datum)
    this.apiService.getRankingsGroupByDepartmentWithPeriod(timePeriod).subscribe(
      (data: RankingDto[]) => {
        this.rankings = data;
        loading.dismiss(); // Dismiss the loading spinner
        this.scrollToUserDepartment();
        this.checkInitialVisibility();
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

  isUserDepartmentTop(): boolean {
    const userRankingIndex = this.rankings.findIndex(ranking => ranking.dienstelle_id === this.user?.dienstelle_id);
    return userRankingIndex !== -1 && userRankingIndex < 6;
  }

  scrollToUserDepartment() {
    if (!this.user) return;

    const userRankingIndex = this.rankings.findIndex(ranking => ranking.dienstelle_id === this.user!.dienstelle_id);

    if (userRankingIndex !== -1) {
      const userRankingItemId = 'ranking-item-' + userRankingIndex;
      const userRankingItem = document.getElementById(userRankingItemId);

      if (userRankingItem) {
        const offsetTop = userRankingItem.offsetTop;
        this.content.scrollToPoint(0, offsetTop - 100, 1000).then(() => {
          this.showScrollButton = false;
          this.userScrolled = false; // Reset user scrolled state after scrolling to the user department
        });
      }
    }
  }

  onScroll(event: any) {
    if (this.userScrolled) {
      this.showScrollButton = true;
    } else {
      this.userScrolled = true;
    }
  }

  checkInitialVisibility() {
    if (this.isUserDepartmentTop()) {
      this.showScrollButton = false;
    } else {
      this.showScrollButton = true;
    }
  }
}
