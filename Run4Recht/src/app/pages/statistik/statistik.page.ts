import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../../api.service';
import { StatisticDto } from '../../models';

@Component({
  selector: 'app-statistik',
  templateUrl: './statistik.page.html',
  styleUrls: ['./statistik.page.scss'],
})
export class StatistikPage implements OnInit {
  totalSteps: number = 0;
  averageSteps: number = 0;
  statistics: StatisticDto[] = [];

  constructor(private apiService: ApiService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.apiService.getStatistics(1).subscribe((data: StatisticDto[]) => {
      this.statistics = data;
      this.calculateTotals();
      this.createChart();
    }, error => {
      console.error('Error fetching statistics', error);
    });
  }

  calculateTotals() {
    if (this.statistics.length > 0) {
      this.totalSteps = this.statistics.reduce((sum, stat) => sum + stat.schritte, 0);
      this.averageSteps = this.totalSteps / this.statistics.length;
    }
  }

  createChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    const data = this.statistics.map(stat => stat.schritte);
    const labels = this.statistics.map((_, index) => `Day ${index + 1}`); // Adjust labels as needed

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Steps',
          data: data,
          backgroundColor: [
            "#1E612B",
            "#1E612B",
            "#1E612B",
            "#1E612B",
            "#1E612B",
            "#1E612B",
            "#1E612B"
          ],
          barThickness: 20,
          borderRadius: 5,
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}
