import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
registerLocaleData(localeVi);
export const appConfig: ApplicationConfig = {
  providers: [
    // SỬA LỖI: Cung cấp Zone.js với cấu hình chuẩn.
    // Điều này sẽ sửa lỗi cú pháp TS2353 và cung cấp NgZone mà ứng dụng yêu cầu.
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    { provide: 'defaultLanguage', useValue: 'vi' },
  ],
};
