// PASTE TOÀN BỘ CODE NÀY VÀO FILE: sidebar.component.ts

import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  // Sửa lỗi: Thêm CommonModule để dùng được *ngIf
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);

  // Biến để lưu vai trò người dùng
  userRole: string = '';

  ngOnInit(): void {
    // Lấy thông tin đã giải mã từ token
    const decodedToken = this.authService.decodeToken();
    // Gán vai trò vào biến userRole (nếu có)
    this.userRole = decodedToken?.role || '';
  }

  logout(): void {
    this.authService.logout();
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }
}
