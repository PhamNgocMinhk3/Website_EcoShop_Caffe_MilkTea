import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5004/api/Auth';

  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private isBrowser: boolean;

  public isLoggedIn$ = new BehaviorSubject<boolean>(
    !!this.tokenService.getAccessToken()
  );

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private b64DecodeUnicode(str: string): string {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  }

  decodeToken(): { role: string; name: string } | null {
    if (!this.isBrowser) return null;

    const token = this.tokenService.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(this.b64DecodeUnicode(token.split('.')[1]));

      const role =
        payload[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] || '';
      const name =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        '';
      return { role, name };
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response) => {
        this.tokenService.saveAuthData(
          response.userId,
          response.accessToken,
          response.refreshToken
        );
        this.isLoggedIn$.next(true);
        setTimeout(() => {
          const decodedToken = this.decodeToken();
          if (
            decodedToken?.role === 'Quản lý' ||
            decodedToken?.role === 'Nhân viên'
          ) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        }, 100);
      })
    );
  }

  logout(): void {
    this.tokenService.clearAuthData();
    this.isLoggedIn$.next(false);
    this.router.navigate(['/auth/login']);
  }

  validateToken(): Observable<boolean> {
    const token = this.tokenService.getAccessToken();
    if (!token) {
      return of(false);
    }
    return this.http.post(`${this.baseUrl}/validate-token`, {}).pipe(
      map(() => {
        this.isLoggedIn$.next(true);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  register(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, credentials);
  }

  forgotPassword(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, data);
  }
}
