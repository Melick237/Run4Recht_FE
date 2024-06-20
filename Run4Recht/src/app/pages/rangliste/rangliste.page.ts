import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rangliste',
  templateUrl: './rangliste.page.html',
  styleUrls: ['./rangliste.page.scss'],
})
export class RanglistePage implements OnInit {

  selectedItem: number = 3;
  constructor() { }

  onItemClick(itemNumber: number) {
    this.selectedItem = itemNumber; // Met à jour l'élément sélectionné
  }

  ngOnInit() {
  }

}
