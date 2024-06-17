import { Injectable } from '@angular/core';

declare var cordova: any;

@Injectable({
  providedIn: 'root'
})
export class HealthService {

  constructor() { }

  isAvailable(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      cordova.plugins.health.isAvailable((available: boolean | PromiseLike<boolean>) => {
        resolve(available);
      }, (error: any) => {
        reject(error);
      });
    });
  }

  requestAuthorization(): Promise<void> {
    return new Promise((resolve, reject) => {
      const permissions = {
        read: ['steps'],
        write: []
      };
      cordova.plugins.health.requestAuthorization(permissions, (success: any) => {
        console.log(success)
        resolve();
      }, (error: any) => {
        reject(error);
      });
    });
  }

  querySteps(startDate: Date, endDate: Date): Promise<number> {
    return new Promise((resolve, reject) => {
      cordova.plugins.health.query({
        startDate: startDate,
        endDate: endDate,
        dataType: 'steps'
      }, (data: any[]) => {
        const steps = data.reduce((total, item) => total + item.value, 0);
        console.log(data)

        resolve(steps);
      }, (error: any) => {
        reject(error);
      });
    });
  }
}
