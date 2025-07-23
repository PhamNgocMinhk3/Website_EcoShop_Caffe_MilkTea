import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css'],
})
export class RegisterFormComponent {
  credentials = { email: '', password: '', confirmPassword: '' };
  isLoading = false;

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  onSubmit(): void {
    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.notificationService.showError('Mật khẩu xác nhận không khớp.', 2000);
      return;
    }
    this.isLoading = true;

    const registerData = {
      email: this.credentials.email,
      password: this.credentials.password,
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.notificationService.show(
          response.message || 'Đăng ký thành công!'
        );
        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.showError(
          err.error || 'Email đã tồn tại hoặc có lỗi.',
          2000
        );
        this.isLoading = false;
      },
    });
  }
}
