import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-manager',
  templateUrl: './home-manager.page.html',
  styleUrls: ['./home-manager.page.scss'],
})
export class HomeManagerPage implements OnInit {

  date1: string = 'Donnerstag, der';
  date2: string = '12.09.2024';
  schritte: number = 33.800;
  teilnehmer: number = 25;
  strecke: number = 407;

  constructor() { }

  ngOnInit() {
  }

}
