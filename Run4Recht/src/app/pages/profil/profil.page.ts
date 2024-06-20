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

  constructor() { }

  ngOnInit() {
  }

}
