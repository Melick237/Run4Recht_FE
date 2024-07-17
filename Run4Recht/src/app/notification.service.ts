import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ApiService } from './api.service';
import { TimePeriodDto, StatisticDto, TournamentInfoDto, UserDto } from './models';
import { UserService } from "./user.service";
import { Storage } from '@ionic/storage-angular';
import { Subscription, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsEnabledSubject = new BehaviorSubject<boolean>(false);
  notificationsEnabled$ = this.notificationsEnabledSubject.asObservable();

  private tournamentStartDate!: Date;
  private tournamentEndDate!: Date;
  private currentWeek: any;
  private position: number = 0;
  private differenceToFront: number = 0;
  private differenceToBack: number = 0;
  userSubscription: Subscription | undefined;
  user: UserDto | null = null;

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private storage: Storage
  ) {
    this.init();
  }

  private async init() {
    await this.storage.create();
    const enabled = await this.storage.get('notificationsEnabled');
    this.notificationsEnabledSubject.next(enabled || false);
    await this.checkPermission();
  }

  public async checkPermission() {
    const permission = await LocalNotifications.checkPermissions();
    const granted = permission.display === 'granted';
    this.notificationsEnabledSubject.next(granted);
    if (granted) {
      this.userSubscription = this.userService.user$.subscribe(user => {
        this.user = user;
        if (user) {
          this.fetchTournamentInfo();
        }
      });
      await this.scheduleDailyReminder();
      await this.scheduleTestNotification();
    } else {
      await this.requestPermission();
    }
  }

  public async requestPermission() {
    const permission = await LocalNotifications.requestPermissions();
    const granted = permission.display === 'granted';
    this.notificationsEnabledSubject.next(granted);
    await this.storage.set('notificationsEnabled', granted);
  }

  public async toggleNotifications(enable: boolean) {
    if (enable) {
      await this.requestPermission();
    } else {
      await this.cancelAllNotifications();
    }
    this.notificationsEnabledSubject.next(enable);
    await this.storage.set('notificationsEnabled', enable);
  }

  async cancelAllNotifications() {
    const pending = await this.getPendingNotifications();
    const notificationIds = pending.notifications.map(notification => notification.id);
    await LocalNotifications.cancel({ notifications: notificationIds.map(id => ({ id })) });
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
              hour: 18,
              minute: 30,
            },
            repeats: true
          },
          sound: undefined,
          attachments: [{ id: 'logo', url: 'res://assets/images/logo.png', options: {} }],
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
            at: new Date(Date.now() + 10000)
          },
          sound: undefined,
          attachments: [{ id: 'logo', url: 'res://assets/images/logo.png', options: {} }],
          actionTypeId: "",
          extra: null
        }
      ]
    });
    console.log('Scheduled test notification:', notification);
  }

  async getPendingNotifications() {
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
      await this.loadRankings();
    } catch (error) {
      console.error('Error fetching tournament info', error);
    }
  }

  private getMotivationalMessage(): { title: string, body: string } {
    const positionMessage = `Sie befinden sich aktuell auf Platz ${this.position}.`;
    const differenceToFrontMessage = `Sie sind nur ${this.differenceToFront} Schritte hinter dem nächsten Platz.`;
    const differenceToBackMessage = `Sie haben einen Vorsprung von ${this.differenceToBack} Schritten auf den nächsten Platz.`;

    const messages = [
      { title: "Sie haben einen Vorsprung!", body: differenceToBackMessage },
      { title: "Aufholjagd starten!", body: differenceToFrontMessage },
      { title: "Ihre aktuelle Position", body: positionMessage },
      { title: "Status Update", body: `${positionMessage} ${differenceToBackMessage}` },
      { title: "Aufholjagd starten!", body: differenceToFrontMessage },
      { title: "Das Ziel ist nahe!", body: differenceToFrontMessage },
      { title: "Weiter so!", body: `${positionMessage} Halten Sie Ihren Vorsprung von ${this.differenceToBack} Schritten und versuchen Sie, die ${this.differenceToFront} Schritte aufzuholen, um den nächsten Platz zu erreichen.` }
    ];

    const motivatingMessages = messages.filter(msg => msg.body.includes("Schritte"));
    if (motivatingMessages.length > 0) {
      return motivatingMessages[Math.floor(Math.random() * motivatingMessages.length)];
    }
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
