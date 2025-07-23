import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProductListPageComponent } from './features/products/pages/product-list-page/product-list-page.component';
import { ProductDetailPageComponent } from './features/products/pages/product-detail-page/product-detail-page.component';
import { SelectTablePageComponent } from './features/tables/pages/select-table-page/select-table-page.component';
import { CheckoutPageComponent } from './features/checkout/pages/checkout-page/checkout-page.component';
import { ContactPageComponent } from './features/contact/pages/contact-page/contact-page.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard'; // <-- Import thêm roleGuard
import { PaymentResultComponent } from './features/checkout/pages/payment-result/payment-result.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },
  { path: 'products', component: ProductListPageComponent },
  { path: 'products/:id', component: ProductDetailPageComponent },
  { path: 'contact', component: ContactPageComponent },
  {
    path: 'select-table',
    component: SelectTablePageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'checkout',
    component: CheckoutPageComponent,
    canActivate: [authGuard],
  },
  { path: 'payment-result', component: PaymentResultComponent },
  // SỬA LỖI: Dùng đúng roleGuard để kiểm tra vai trò
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    canActivate: [roleGuard],
    data: {
      roles: ['Quản lý', 'Nhân viên'],
    },
  },
];
