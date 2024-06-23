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

}
