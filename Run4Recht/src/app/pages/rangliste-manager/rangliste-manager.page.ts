import { Component, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular';
import { StepsModalComponent } from '../../steps-modal/steps-modal.component';

@Component({
  selector: 'app-rangliste-manager',
  templateUrl: './rangliste-manager.page.html',
  styleUrls: ['./rangliste-manager.page.scss'],
})
export class RanglisteManagerPage implements OnInit {

  selectedItem: number = 3;
  constructor(private modalController: ModalController) { }

  async openStepsModal() {
    const modal = await this.modalController.create({
      component: StepsModalComponent,
      cssClass: 'alert-modal'
    });
    return await modal.present();
  }

  onItemClick(itemNumber: number) {
    this.selectedItem = itemNumber; // Met à jour l'élément sélectionné
  }

  ngOnInit() {
  }

}
