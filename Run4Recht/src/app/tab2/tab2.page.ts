import {Component, OnInit} from '@angular/core';
import {HealthService} from "../health.service";
import {Platform} from "@ionic/angular";

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{
  stepsToday: number = 0;

  constructor(private healthService: HealthService, private platform: Platform) {}

  ngOnInit() {
    this.platform.ready().then(() => {
      this.initializeHealth();
    });
  }

  initializeHealth() {
    console.log('sending');
    this.healthService.isAvailable().then((available: boolean) => {
      if (available) {
        console.log('is available');

        this.healthService.requestAuthorization()
          .then(() => {
            console.log('asking for stepd');
            this.getTodaySteps();
          })
          .catch(e => console.log('Error requesting authorization', e));
      } else {
        console.log('Health is not available');
      }
    })
      .catch(e => console.log('Error checking health availability', e));
  }

  getTodaySteps() {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Start of today
    const endDate = new Date(); // Current time

    console.log(startDate.getDate())
    this.healthService.querySteps(startDate, endDate).then(steps => {
      this.stepsToday = steps;
    }).catch(e => console.log('Error querying steps', e));
  }
}

