import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';

  constructor(private navCtrl: NavController) { }

  onSubmit() {
    if (this.email) {
      // Logique pour gérer la soumission du formulaire
      console.log('Email:', this.email);
      // Par exemple, rediriger vers une autre page
      // this.navCtrl.navigateForward('/next-page');
    } else {
      console.log('Veuillez entrer une adresse e-mail valide.');
    }
  }
}

