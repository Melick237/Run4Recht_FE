import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { UserService } from '../../user.service';
import { ProfileDto, UserDto } from '../../models';
import { LoadingController, AlertController } from '@ionic/angular';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
})
export class ProfilPage implements OnInit {
  stepGoal: number = 10000;
  height: number = 170;
  stepLength: number = 60;
  notificationsEnabled: boolean = true;
  nightModeEnabled: boolean = false;
  managerViewEnabled: boolean = false;
  heights: number[] = [];
  stepLengths: number[] = [];

  user: UserDto | null = null;

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private loadingController: LoadingController,
    private notificationService: NotificationService,
    private alertController: AlertController
  ) {
    for (let i = 150; i <= 200; i++) {
      this.heights.push(i);
    }
    for (let y = 50; y <= 100; y++) {
      this.stepLengths.push(y);
    }
  }

  ngOnInit() {
    this.userService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadProfile(user.id);
      }
    });
    this.notificationService.notificationsEnabled$.subscribe(enabled => {
      this.notificationsEnabled = enabled;
    });

    // Load the manager view state from local storage
    const savedManagerViewEnabled = localStorage.getItem('managerViewEnabled');
    if (savedManagerViewEnabled !== null) {
      this.managerViewEnabled = JSON.parse(savedManagerViewEnabled);
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

  async loadProfile(userId: number) {
    const loading = await this.presentLoading('Loading profile...');
    this.apiService.getProfile(userId).subscribe(
      (profile: ProfileDto) => {
        this.stepGoal = profile.tagesziel;
        this.height = profile.koerpergroesse;
        this.stepLength = profile.schrittlaenge;
        loading.dismiss();
      },
      error => {
        console.error('Error loading profile', error);
        loading.dismiss();
      }
    );
  }

  async updateProfile() {
    if (!this.user) {
      console.error('User not available');
      return;
    }

    const updatedProfile: ProfileDto = {
      tagesziel: this.stepGoal,
      koerpergroesse: this.height,
      schrittlaenge: this.stepLength
    };

    this.apiService.updateProfile(this.user.id, updatedProfile).subscribe(
      (profile: ProfileDto) => {
        console.log('Profile updated successfully', profile);
      },
      error => {
        console.error('Error updating profile', error);
      }
    );
  }

  increaseStepGoal() {
    this.stepGoal += 50;
    this.updateProfile();
  }

  decreaseStepGoal() {
    if (this.stepGoal > 0) {
      this.stepGoal -= 50;
      this.updateProfile();
    }
  }

  get formattedStepGoal(): string {
    return this.stepGoal.toLocaleString('de-DE');
  }

  updateStepGoal(value: string | number | null | undefined) {
    if (typeof value === 'string') {
      this.stepGoal = parseInt(value.replace(/\./g, ''), 10) || 0;
      this.updateProfile();
    }
  }

  async toggleNotifications() {
    await this.notificationService.toggleNotifications(this.notificationsEnabled);
  }

  async toggleNightMode() {
    this.nightModeEnabled = !this.nightModeEnabled;
    const alert = await this.alertController.create({
      header: 'Nachtmodus',
      message: 'Nachtmodus ist noch nicht implementiert.',
      buttons: ['Zustimmen']
    });
    await alert.present();
  }

  async toggleManagerView() {
    //this.managerViewEnabled = !this.managerViewEnabled;
    this.userService.setManagerView(this.managerViewEnabled);
    //window.location.reload(); // Reload to apply the changes
  }
}
