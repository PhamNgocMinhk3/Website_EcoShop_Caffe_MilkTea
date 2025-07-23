import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent {
  credentials = { email: '', password: '' };
  isLoading = false;

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService); // Inject service

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.notificationService.showError(
        'Vui lòng nhập đầy đủ thông tin.',
        2000
      );
      return;
    }
    this.isLoading = true;

    this.authService.login(this.credentials).subscribe({
      next: () => {
        /* AuthService sẽ tự chuyển trang */
      },
      error: (err) => {
        this.notificationService.showError(
          'Email hoặc mật khẩu không chính xác.',
          2000
        );
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
