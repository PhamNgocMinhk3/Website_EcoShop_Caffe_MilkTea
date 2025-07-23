import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
// Sửa lỗi: Đường dẫn import chính xác
import {
  NotificationService,
  Notification,
} from './core/services/notification.service';
// SỬA LỖI: Cập nhật lại đường dẫn theo đúng cấu trúc thư mục của bạn
import { NotificationComponent } from './features/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // Giữ lại các import cần thiết cho hệ thống thông báo
  imports: [RouterOutlet, CommonModule, NotificationComponent],
  // Cập nhật lại tên file template và style cho phù hợp
  templateUrl: './app.html',
  styleUrl: './app.css',
})
// Cập nhật lại tên class cho phù hợp
export class App {
  title = 'client';

  // Toàn bộ logic quản lý notification được giữ lại
  notifications: Notification[] = [];
  private notificationService = inject(NotificationService);

  constructor() {
    this.notificationService.notification$.subscribe((notification) => {
      this.notifications.push(notification);
    });
  }

  // Hàm này được gọi khi một notification tự đóng
  onNotificationClose(index: number) {
    this.notifications.splice(index, 1);
  }
}
