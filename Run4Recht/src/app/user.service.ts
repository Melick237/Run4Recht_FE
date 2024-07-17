import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserDto } from './models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject: BehaviorSubject<UserDto | null> = new BehaviorSubject<UserDto | null>(null);
  public user$: Observable<UserDto | null> = this.userSubject.asObservable();

  private managerViewSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public managerViewEnabled$: Observable<boolean> = this.managerViewSubject.asObservable();

  setUser(user: UserDto): void {
    this.userSubject.next(user);
  }

  getUser(): UserDto | null {
    return this.userSubject.value;
  }

  setManagerView(enabled: boolean): void {
    this.managerViewSubject.next(enabled);
  }

  getManagerView(): boolean {
    return this.managerViewSubject.value;
  }
}
