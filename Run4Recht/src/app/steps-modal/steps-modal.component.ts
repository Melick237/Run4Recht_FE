import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from '../api.service';
import { UserService } from '../user.service';
import { StatisticDto } from '../models';

@Component({
  selector: 'app-steps-modal',
  templateUrl: './steps-modal.component.html',
  styleUrls: ['./steps-modal.component.scss'],
})
export class StepsModalComponent implements OnInit {
  @Input() userId?: number;  // Optional input for userId
  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
  steps: number = 0;

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private userService: UserService
  ) {}

  ngOnInit() {
    if (!this.userId) {
      const user = this.userService.getUser();
      if (user) {
        this.userId = user.id;
      } else {
        console.error('No user ID available');
        this.dismiss(false);
      }
    }
  }

  dismiss(dataSaved: boolean = false) {
    this.modalController.dismiss(dataSaved);
  }

  onStartDateChange(event: any) {
    this.startDate = event.detail.value;
  }

  onEndDateChange(event: any) {
    this.endDate = event.detail.value;
  }

  saveSteps() {
    if (!this.userId) {
      console.error('User ID not available');
      return;
    }

    const statistic: StatisticDto = {
      id: null,
      mitarbeiter_id: this.userId,  // Use the userId determined in ngOnInit
      schritte: this.steps,
      strecke: this.calculateDistance(this.steps),
      datum: this.startDate // Use the start date as the date for this statistic
    };

    this.apiService.updateStatistic(statistic).subscribe(response => {
      console.log('Steps updated successfully:', response);
      this.dismiss(true); // Indicate that data was saved
    }, error => {
      console.error('Error updating steps:', error);
      this.dismiss(false); // Indicate that data was not saved
    });
  }

  calculateDistance(steps: number): number {
    const averageStepLength = 0.0008; // Average step length in km, adjust if necessary
    return steps * averageStepLength;
  }
}
