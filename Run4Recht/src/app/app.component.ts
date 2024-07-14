import { Component, OnInit } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.platform.ready().then(() => {
      this.initializeNetworkEvents();
    });
  }

  initializeNetworkEvents() {
    Network.addListener('networkStatusChange', async (status: { connected: any; }) => {
      if (!status.connected) {
        console.log("APP LINE 25 connection lost ")
        await this.showAlert('Internet Connection Lost', 'You are now offline.');
      } else {
        await this.showAlert('Internet Connection Restored', 'You are back online.');
      }
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
