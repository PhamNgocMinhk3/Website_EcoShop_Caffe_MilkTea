import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getAccessToken(): string | null {
    return this.getCookie('accessToken');
  }
  getRefreshToken(): string | null {
    return this.getCookie('refreshToken');
  }
  getUserId(): string | null {
    return this.getCookie('userId');
  }

  saveAuthData(
    userId: string,
    accessToken: string,
    refreshToken: string
  ): void {
    if (!this.isBrowser) return;
    this.setCookie('userId', userId, 7 * 24 * 60 * 60); // Lưu userId trong 7 ngày
    this.setCookie('accessToken', accessToken, 15 * 60); // Hạn 15 phút
    this.setCookie('refreshToken', refreshToken, 7 * 24 * 60 * 60); // Hạn 7 ngày
  }

  clearAuthData(): void {
    if (!this.isBrowser) return;
    this.deleteCookie('userId');
    this.deleteCookie('accessToken');
    this.deleteCookie('refreshToken');
  }

  // --- Các hàm tiện ích cho Cookie (giữ nguyên) ---
  private setCookie(name: string, value: string, maxAgeSeconds: number): void {
    document.cookie = `${name}=${
      value || ''
    }; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Strict; Secure`;
  }
  private getCookie(name: string): string | null {
    if (!this.isBrowser) return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  private deleteCookie(name: string): void {
    document.cookie =
      name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}
