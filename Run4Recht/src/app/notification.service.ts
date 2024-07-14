import { Injectable } from '@angular/core';
import { LocalNotificationPendingList, LocalNotifications } from '@capacitor/local-notifications';
import { ApiService } from './api.service'; // Make sure to import your ApiService
import { TimePeriodDto, StatisticDto, TournamentInfoDto, UserDto } from './models';
import { UserService } from "./user.service";
import { Subscription } from "rxjs"; // Adjust the import based on your actual models

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private tournamentStartDate!: Date;
  private tournamentEndDate!: Date;
  private currentWeek: any; // Define the type based on your implementation
  private position: number = 0;
  private differenceToFront: number = 0;
  private differenceToBack: number = 0;
  userSubscription: Subscription | undefined;
  user: UserDto | null = null;

  constructor(private apiService: ApiService, private userService: UserService) {
    this.checkPermission().then(r => console.log("LINE  ", r));
  }

  public async checkPermission() {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display === 'granted') {
      console.log('Notification permission granted.');
      this.userSubscription = this.userService.user$.subscribe(user => {
        this.user = user;
        console.log(user)
        if (user) {
          // this.loadRankings(); // Load rankings on init
        }
      });
      await this.fetchTournamentInfo();
      await this.scheduleDailyReminder();
      await this.scheduleTestNotification();
    } else {
      console.log('Notification permission denied.');
      await this.requestPermission();
    }
  }

  public async requestPermission() {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      // Open app settings for notifications
      await LocalNotifications.requestPermissions();
    }
  }

  async scheduleDailyReminder() {
    const message = await this.getMotivationalMessage();
    const notifications = await LocalNotifications.schedule({
      notifications: [
        {
          title: message.title,
          body: message.body,
          id: 1,
          schedule: {
            on: {
              hour: 12,
              minute: 30,
            },
            repeats: true
          },
          sound: undefined,
          attachments: [{ id: 'logo', url: 'Run4Recht/src/assets/images/logo.png', options: {} }],
          actionTypeId: "",
          extra: null
        }
      ]
    });
    console.log('Scheduled daily reminder:', notifications);
  }

  async scheduleTestNotification() {
    const message = await this.getMotivationalMessage();
    const notification = await LocalNotifications.schedule({
      notifications: [
        {
          title: message.title,
          body: message.body,
          id: 2,
          schedule: {
            at: new Date(Date.now() + 10000) // 10 seconds from now
          },
          sound: undefined,
          attachments: [{ id: 'logo', url: 'Run4Recht/src/assets/images/logo.png', options: {} }],
          actionTypeId: "",
          extra: null
        }
      ]
    });
    console.log('Scheduled test notification:', notification);
  }

  async getPendingNotifications(): Promise<LocalNotificationPendingList> {
    return await LocalNotifications.getPending();
  }

  async cancelNotification(notificationId: number) {
    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }]
    });
  }

  async loadRankings(): Promise<number> {
    if (!this.tournamentStartDate || !this.tournamentEndDate) {
      console.error('User or tournament dates not available');
      return -1;
    }

    const timePeriod: TimePeriodDto = {
      von_datum: new Date(Date.UTC(this.tournamentStartDate.getFullYear(), this.tournamentStartDate.getMonth(), this.tournamentStartDate.getDate())).toISOString().split('T')[0],
      bis_datum: new Date(Date.UTC(this.tournamentEndDate.getFullYear(), this.tournamentEndDate.getMonth(), this.tournamentEndDate.getDate())).toISOString().split('T')[0],
    };

    try {
      const statistics: StatisticDto[] | undefined = await this.apiService.getStatisticsGroupByDepartmentWithPeriod(this.user!.dienstelle_id, timePeriod).toPromise();
      const sortedStatistics = statistics!.sort((a, b) => b.schritte - a.schritte);

      const userIndex = sortedStatistics.findIndex(stat => stat.mitarbeiter_id === this.user!.id);

      if (userIndex > -1) {
        this.position = userIndex + 1;
        let differenceToFront = Number.MAX_VALUE;
        let differenceToBack = Number.MAX_VALUE;

        if (userIndex < sortedStatistics.length - 1) {
          differenceToFront = sortedStatistics[userIndex + 1].schritte - sortedStatistics[userIndex].schritte;
        }
        if (userIndex > 0) {
          differenceToBack = sortedStatistics[userIndex].schritte - sortedStatistics[userIndex - 1].schritte;
        }

        this.differenceToFront = Math.abs(differenceToBack);
        this.differenceToBack = Math.abs(differenceToFront);

        return Math.min(this.differenceToFront, this.differenceToBack);
      }
    } catch (error) {
      console.error('Error fetching rankings', error);
    }
    return 0;
  }

  async fetchTournamentInfo() {
    try {
      const tournamentInfo: TournamentInfoDto | undefined = await this.apiService.getTournamentInfo().toPromise();
      this.tournamentStartDate = new Date(tournamentInfo!.datum_beginn);
      this.tournamentEndDate = new Date(tournamentInfo!.datum_ende);
      await this.loadRankings(); // Load rankings on init
    } catch (error) {
      console.error('Error fetching tournament info', error);
    }
  }

  private getMotivationalMessage(): { title: string, body: string } {
    const positionMessage = `Sie befinden sich aktuell auf Platz ${this.position}.`;
    const differenceToFrontMessage = `Sie sind nur ${this.differenceToFront} Schritte hinter dem nächsten Platz.`;
    const differenceToBackMessage = `Sie haben einen Vorsprung von ${this.differenceToBack} Schritten auf den nächsten Platz.`;

    // Define potential messages
    const messages = [
      { title: "Sie haben einen Vorsprung!", body: differenceToBackMessage },
      { title: "Aufholjagd starten!", body: differenceToFrontMessage },
      { title: "Ihre aktuelle Position", body: positionMessage },
      { title: "Status Update", body: `${positionMessage} ${differenceToBackMessage}` },
      { title: "Aufholjagd starten!", body: differenceToFrontMessage },
      { title: "Das Ziel ist nahe!", body: differenceToFrontMessage },
      { title: "Weiter so!", body: `${positionMessage} Halten Sie Ihren Vorsprung von ${this.differenceToBack} Schritten und versuchen Sie, die ${this.differenceToFront} Schritte aufzuholen, um den nächsten Platz zu erreichen.` }
    ];

    // Logic to select the most motivating message
    const motivatingMessages = messages.filter(msg => msg.body.includes("Schritte"));
    if (motivatingMessages.length > 0) {
      return motivatingMessages[Math.floor(Math.random() * motivatingMessages.length)];
    }
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
