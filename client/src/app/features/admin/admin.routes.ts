// src/app/features/admin/admin.routes.ts

import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard-page/dashboard-page.component').then(
            (m) => m.DashboardPageComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import(
            './pages/order-management-page/order-management-page.component'
          ).then((m) => m.OrderManagementPageComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import(
            './pages/product-management-page/product-management-page.component'
          ).then((m) => m.ProductManagementPageComponent),
      },
      {
        path: 'tables',
        loadComponent: () =>
          import(
            './pages/table-management-page/table-management-page.component'
          ).then((m) => m.TableManagementPageComponent),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import(
            './pages/employee-management-page/employee-management-page.component'
          ).then((m) => m.EmployeeManagementPageComponent),
      },
      {
        path: 'warehouse',
        loadComponent: () =>
          import(
            './pages/warehouse-management-page/warehouse-management-page.component'
          ).then((m) => m.WarehouseManagementPageComponent),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import(
            './pages/work-schedule-page/work-schedule-page.component'
          ).then((m) => m.WorkSchedulePageComponent),
      },
      {
        path: 'schedule_work',
        loadComponent: () =>
          import(
            './pages/view-schedule-page/view-schedule-page.component'
          ).then((m) => m.ViewSchedulePageComponent),
      },
      {
        path: 'time-tracking',
        loadComponent: () =>
          import(
            './pages/time-tracking-page/time-tracking-page.component'
          ).then((m) => m.TimeTrackingPageComponent),
      },
      {
        path: 'salary', // Đường dẫn bạn muốn, ví dụ: /admin/payroll
        loadComponent: () =>
          import('./pages/payroll-page/payroll-page.component').then(
            (m) => m.PayrollPageComponent
          ),
      },
      {
        path: 'statistics', // Đường dẫn bạn muốn, ví dụ: /admin/payroll
        loadComponent: () =>
          import('./pages/statistics-page/statistics-page.component').then(
            (m) => m.StatisticsPageComponent
          ),
      },
    ],
  },
];
