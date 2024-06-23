import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
})
export class ProfilPage implements OnInit {

  stepGoal: number = 10000;
  height: number = 170;
  stepLength: number = 60;
  notificationsEnabled: boolean = true;
  nightModeEnabled: boolean = false;
  managerViewEnabled: boolean = false;
  heights: number[] = [];
  stepLengths: number[] = [];

  constructor() {
    // Génère une liste de tailles de 150 cm à 200 cm
    for (let i = 150; i <= 200; i++) {
      this.heights.push(i);
    }
    for (let y = 10; y <= 150; y++) {
      this.stepLengths.push(y);
    }
  }

  ngOnInit() {
  }

  // Méthodes pour augmenter et diminuer la valeur de stepGoal
  increaseStepGoal() {
    this.stepGoal += 50;
  }

  decreaseStepGoal() {
    if (this.stepGoal > 0) {
      this.stepGoal -= 50;
    }
  }

  // Méthode pour formater stepGoal pour affichage
  get formattedStepGoal(): string {
    return this.stepGoal.toLocaleString('de-DE');
  }

  // Méthode pour mettre à jour stepGoal depuis l'input
  updateStepGoal(value: string | number | null | undefined) {
    if (typeof value === 'string') {
      this.stepGoal = parseInt(value.replace(/\./g, ''), 10) || 0;
    }
  }
}
