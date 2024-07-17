import {Component, OnInit} from '@angular/core';
import {Platform, AlertController, ToastController} from '@ionic/angular';
import {Network} from '@capacitor/network';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private toastController: ToastController) {
  }

  ngOnInit(): void {
    this.platform.ready().then(() => {
      this.initializeNetworkEvents();
    });
  }

  initializeNetworkEvents() {
    Network.addListener('networkStatusChange', async (status: { connected: any; }) => {
      if (!status.connected) {

        console.log("Verbindung verloren");
        await this.presentToast('Internetverbindung verloren', 'danger');

      } else {
        console.log("Verbindung wiederhergestellt");
        await this.presentToast('Internetverbindung wiederhergestellt', 'success');
      }
    })

  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 1500
    });
    toast.present();
  }
}

