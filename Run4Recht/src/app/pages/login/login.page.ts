import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from '../../api.service';
import { UserService } from '../../user.service';
import { UserDto, Role } from '../../models';
import { Storage } from '@ionic/storage-angular';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  // password: string = '$2a$10$fGkD/jl8LScyVf29APyCfeTWPXHMfdVWASBdS6ARHCuq/Ig7Ab3r.';
  //password: string = 'run4recht-1-4'; // Hardcoded password

  constructor(
    private navCtrl: NavController,
    private apiService: ApiService,
    private userService: UserService,
    private storage: Storage,
    private notificationService: NotificationService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const storedEmail = await this.storage.get('email');
    if (storedEmail) {
      this.email = storedEmail;
      // await this.login(); // Uncomment if you want to auto-login
    }
  }

  async onSubmit() {
    if (this.email) {
      await this.storage.set('email', this.email);
      this.login();
    } else {
      console.log('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      this.presentToast('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'danger');
    }
  }

  private async login() {
    const loading = await this.loadingController.create({
      message: 'Bitte warten...',
    });
    await loading.present();
    const userDto: UserDto = {
      id: 0,
      name: '',
      email: this.email,
      role: Role.USER,
      dienstelle_id: 0,
      passwort: ''
    };

    this.apiService.login(userDto).subscribe(
      async (response: UserDto) => {
        console.log('Login erfolgreich:', response);
        this.userService.setUser(response);
        this.apiService.setCredentials(response.email, response.passwort); // Store credentials after successful login
        await this.scheduleNotifications();
        this.navCtrl.navigateForward('/tabs/home');
        await loading.dismiss();
        this.presentToast('Login erfolgreich!', 'success');
      },
      async (error: any) => {
        console.error('Login fehlgeschlagen:', error);
        await loading.dismiss();
        this.presentToast('Login fehlgeschlagen. Bitte versuchen Sie es erneut.', 'danger');
      }
    );
  }

  private async scheduleNotifications() {
    await this.notificationService.checkPermission();
    // await this.notificationService.scheduleDailyReminder();
    // await this.notificationService.scheduleTestNotification();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2000
    });
    toast.present();
  }
}
