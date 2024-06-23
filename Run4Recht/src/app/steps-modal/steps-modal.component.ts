import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from '../api.service';
import { UserService } from '../user.service';
import { PeriodStatisticDto } from '../models';

@Component({
  selector: 'app-steps-modal',
  templateUrl: './steps-modal.component.html',
  styleUrls: ['./steps-modal.component.scss'],
})
export class StepsModalComponent {
  startDate: string = "";
  endDate: string = "";
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
    this.startDate = event.detail.value;
  }

  onEndDateChange(event: any) {
    this.endDate = event.detail.value;
  }

  saveSteps() {
    const user = this.userService.getUser();
    if (user) {
      const periodStatistic: PeriodStatisticDto = {
        mitarbeiter_id: user.id,
        schritte: this.steps,
        strecke: this.calculateDistance(this.steps),
        von_datum: this.startDate,
        bis_datum: this.endDate
      };

      this.apiService.updateStatistics(periodStatistic).subscribe(
          (response: any) => {
          console.log('Steps updated successfully:', response);
          this.dismiss();
        },
          (error: any) => {
          console.error('Error updating steps:', error);
        }
      );
    } else {
      console.error('User not logged in');
    }
  }

  calculateDistance(steps: number): number {
    const averageStepLength = 0.0008; // Average step length in km, adjust if necessary
    return steps * averageStepLength;
  }
}
