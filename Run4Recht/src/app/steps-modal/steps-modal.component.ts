import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from '../api.service';
import { UserService } from '../user.service';
import { StatisticDto } from '../models';

@Component({
  selector: 'app-steps-modal',
  templateUrl: './steps-modal.component.html',
  styleUrls: ['./steps-modal.component.scss'],
})
export class StepsModalComponent {
  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
  steps: number = 0;

  constructor(
    private modalController: ModalController,
    private apiService: ApiService,
    private userService: UserService
  ) {}

  dismiss() {
    this.modalController.dismiss();
  }

  onStartDateChange(event: any) {
    console.log("event start date ", event.detail.startDate, event.detail.value)
    this.startDate = event.detail.value;
  }

  onEndDateChange(event: any) {
    this.endDate = event.detail.value;
  }

  saveSteps() {
    const user = this.userService.getUser();
    if (!user) {
      console.error('Line 38 User not logged in');
      return;
    }
    console.log("line 41 date", this.startDate)

    const statistic: StatisticDto = {
      id: null,
      mitarbeiter_id: user.id,
      schritte: this.steps,
      strecke: this.calculateDistance(this.steps),
      datum: this.startDate // Use the start date as the date for this statistic
    };

    this.apiService.updateStatistic(statistic).subscribe(response => {
      console.log('Line 51 Steps updated successfully:', response);
      this.modalController.dismiss();
    }, error => {
      console.error('Line 54 Error updating steps:', error);
    });
  }

  calculateDistance(steps: number): number {
    const averageStepLength = 0.0008; // Average step length in km, adjust if necessary
    return steps * averageStepLength;
  }
}
