import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { UserService } from '../../user.service';
import { ProfileDto, UserDto } from '../../models';

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

  constructor(private apiService: ApiService, private userService: UserService) {
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

  loadProfile(userId: number) {
    this.apiService.getProfile(userId).subscribe(
      (profile: ProfileDto) => {
        this.stepGoal = profile.tagesziel;
        this.height = profile.koerpergroesse;
        this.stepLength = profile.schrittlaenge;
        // You may need to map other profile fields to local variables if required
      },
      error => {
        console.error('Error loading profile', error);
      }
    );
  }

  updateProfile() {
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
