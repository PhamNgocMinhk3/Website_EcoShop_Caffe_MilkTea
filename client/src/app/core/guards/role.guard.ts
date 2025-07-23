import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { TokenService } from '../services/token.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const tokenService = inject(TokenService);

  if (!tokenService.getAccessToken()) {
    notificationService.showError(
      'Vui lòng đăng nhập để truy cập trang này.',
      2000
    );
    router.navigate(['/auth/login']);
    return false;
  }

  const decodedToken = authService.decodeToken();
  const expectedRoles: string[] = route.data['roles'] || [];

  // console.log(
  //   'User Role:',
  //   decodedToken?.role,
  //   '| Expected Roles:',
  //   expectedRoles
  // );

  const userRole = decodedToken?.role.toLowerCase() || '';
  const hasRequiredRole = expectedRoles.some(
    (role) => role.toLowerCase() === userRole
  );

  if (decodedToken && hasRequiredRole) {
    return true;
  }

  notificationService.showError(
    'Bạn không đủ quyền hạn để truy cập trang này.',
    3000
  );
  router.navigate(['/home']);
  return false;
};
