import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-steps-modal',
  templateUrl: './steps-modal.component.html',
  styleUrls: ['./steps-modal.component.scss'],
})
export class StepsModalComponent {
  startDate: string = "";
  endDate: string = "";
  steps: number = 0;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  saveSteps() {
    // Save steps logic
    this.dismiss();
  }
}
