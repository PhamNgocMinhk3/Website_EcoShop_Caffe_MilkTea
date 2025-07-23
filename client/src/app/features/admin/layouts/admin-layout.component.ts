// src/app/features/admin/layouts/admin-layout/admin-layout.component.ts

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../admin/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent {
  // Lưu trạng thái của sidebar
  isSidebarCollapsed = false;

  // Hàm để thay đổi trạng thái khi nhận được sự kiện từ con
  onToggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
