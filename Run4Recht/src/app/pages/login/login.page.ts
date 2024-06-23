import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../../api.service';
import { UserService } from '../../user.service';
import { UserDto, Role } from '../../models';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';

  constructor(
    private navCtrl: NavController,
    private apiService: ApiService,
    private userService: UserService
  ) {}

  onSubmit() {
    if (this.email) {
      const userDto: UserDto = {
        id: 0, // Placeholder ID, adjust as necessary
        name: '', // Placeholder name, adjust as necessary
        email: this.email,
        role: Role.USER, // Use the Role enum
        dienstelle_id: 0, // Placeholder department ID, adjust as necessary
      };

      this.apiService.login(userDto).subscribe((response: any) => {
        console.log('Login successful:', response);
        this.userService.setUser(response);
        this.navCtrl.navigateForward('/next-page');
      }, (error: any) => {
        console.error('Login failed:', error);
      });
    } else {
      console.log('Veuillez entrer une adresse e-mail valide.');
    }
  }
}
