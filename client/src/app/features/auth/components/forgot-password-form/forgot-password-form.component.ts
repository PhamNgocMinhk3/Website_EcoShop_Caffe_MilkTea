import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.css'],
})
export class ForgotPasswordFormComponent {
  email = '';
  isLoading = false;

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  onSubmit(): void {
    if (!this.email) {
      this.notificationService.showError('Vui lòng nhập email của bạn.', 2000);
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (response) => {
        this.notificationService.show(response.message);
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.show(
          'Nếu email của bạn tồn tại, chúng tôi đã gửi hướng dẫn.'
        );
        this.isLoading = false;
      },
    });
  }
}
