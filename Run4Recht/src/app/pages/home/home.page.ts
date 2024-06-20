import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StepsModalComponent } from '../../steps-modal/steps-modal.component';
import {ApiService} from "../../api.service";
import {StatisticDto} from "../../models";


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  steps: number = 0;
  totalSteps: number = 10000;
  totalDistance: number = 0;
  date1: string = 'Donnerstag, der';
  date2: string = '12.09.2024';
  progress: number = 0;
  stepsLabel: string = '';

  constructor(private modalController: ModalController, private apiService: ApiService) {} // Inject the ApiService

  async openStepsModal() {
    const modal = await this.modalController.create({
      component: StepsModalComponent,
      cssClass: 'alert-modal'
    });
    return await modal.present();
  }

  ngOnInit() {
    console.log()
    this.calculateProgress();
    this.loadStatistics(); // Load statistics on initialization
  }

  calculateProgress() {
    this.progress = (this.steps / this.totalSteps) * 100;
    this.stepsLabel = `/ ${this.totalSteps.toLocaleString()}`;
  }

  // Method to load statistics from the API
  loadStatistics() {
    this.apiService.getStatistics(1).subscribe((data: StatisticDto[]) => {
      if (data && data.length > 0) {
        console.log( "data: ",data)
        // Assuming the latest data is the most recent
        const latestStatistic = data[0];
        this.steps = latestStatistic.schritte;
        this.totalDistance = latestStatistic.strecke;
        this.calculateProgress(); // Recalculate progress with the new data
      }
    }, error => {
      console.error('55 Error loading statistics', error);
    });
  }
}
