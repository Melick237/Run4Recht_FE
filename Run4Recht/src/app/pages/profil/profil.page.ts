import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { UserService } from '../../user.service';
import { ProfileDto, UserDto } from '../../models';
import { LoadingController } from '@ionic/angular';

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
    private loadingController: LoadingController // Inject LoadingController
  ) {
    // Generate a list of heights from 150 cm to 200 cm
    for (let i = 150; i <= 200; i++) {
      this.heights.push(i);
    }
    for (let y = 10; y <= 150; y++) {
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

  async loadProfile(userId: number) {
    const loading = await this.presentLoading('Loading profile...');
    this.apiService.getProfile(userId).subscribe(
      (profile: ProfileDto) => {
        this.stepGoal = profile.tagesziel;
        this.height = profile.koerpergroesse;
        this.stepLength = profile.schrittlaenge;
        loading.dismiss(); // Dismiss the loading spinner
      },
      error => {
        console.error('Error loading profile', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  async updateProfile() {
    if (!this.user) {
      console.error('User not available');
      return;
    }

    const loading = await this.presentLoading('Updating profile...');
    const updatedProfile: ProfileDto = {
      tagesziel: this.stepGoal,
      koerpergroesse: this.height,
      schrittlaenge: this.stepLength
    };

    this.apiService.updateProfile(this.user.id, updatedProfile).subscribe(
      (profile: ProfileDto) => {
        console.log('Profile updated successfully', profile);
        loading.dismiss(); // Dismiss the loading spinner
      },
      error => {
        console.error('Error updating profile', error);
        loading.dismiss(); // Dismiss the loading spinner
      }
    );
  }

  // Methods to increase and decrease stepGoal
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

  // Method to format stepGoal for display
  get formattedStepGoal(): string {
    return this.stepGoal.toLocaleString('de-DE');
  }

  // Method to update stepGoal from input
  updateStepGoal(value: string | number | null | undefined) {
    if (typeof value === 'string') {
      this.stepGoal = parseInt(value.replace(/\./g, ''), 10) || 0;
      this.updateProfile();
    }
  }
}
