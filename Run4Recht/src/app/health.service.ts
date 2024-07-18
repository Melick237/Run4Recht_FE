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

  queryStepsWithDate(startDate: Date, endDate: Date): Promise<{ date: string, steps: number }[]> {
    return new Promise((resolve, reject) => {
      cordova.plugins.health.query({
        startDate: startDate,
        endDate: endDate,
        dataType: 'steps'
      }, (data: any[]) => {
        // Group steps by date
        const stepsByDate: { [date: string]: number } = {};

        data.forEach(item => {
          const date = new Date(item.startDate).toISOString().split('T')[0];
          if (!stepsByDate[date]) {
            stepsByDate[date] = 0;
          }
          stepsByDate[date] += item.value;
        });

        // Convert the grouped data into an array of objects
        const result = Object.keys(stepsByDate).map(date => ({
          date,
          steps: stepsByDate[date]
        }));

        // Log each date and steps as primitive values
        result.forEach(entry => {
          console.log(`Date: ${entry.date}, Steps: ${entry.steps}`);
        });

        resolve(result);
      }, (error: any) => {
        reject(error);
      });
    });
  }


}
