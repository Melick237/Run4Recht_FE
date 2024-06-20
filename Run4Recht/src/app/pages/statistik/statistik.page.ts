import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-statistik',
  templateUrl: './statistik.page.html',
  styleUrls: ['./statistik.page.scss'],
})
export class StatistikPage implements OnInit {

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.createChart();
  }

  createChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        datasets: [{
          label: '',
          data: [8000, 12000, 10000, 9000, 11000, 7000, 10000],
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
              display: false, // Désactiver la grille
            },
          },
          x: {
            grid: {
              display: false, // Désactiver la grille
            },
          },
        },
        plugins: {
          legend: {
            display: false // Masquer la légende
          }
        }
      }
    });
  }
}
