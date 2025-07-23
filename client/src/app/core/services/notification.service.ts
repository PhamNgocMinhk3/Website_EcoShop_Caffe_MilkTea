import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notification$ = this.notificationSubject.asObservable();

  constructor() {}

  show(
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    duration: number = 3000
  ): void {
    this.notificationSubject.next({ message, type, duration });
  }

  showError(message: string, duration: number = 3000): void {
    this.show(message, 'error', duration);
  }
}
