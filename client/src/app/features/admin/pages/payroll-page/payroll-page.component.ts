// src/app/features/admin/pages/payroll-page/payroll-page.component.ts

import {
  Component,
  OnInit,
  inject,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { saveAs } from 'file-saver';

import { PayrollRecord } from '../../../../core/models/payroll.model';
import { PayrollService } from '../../../../core/services/payroll.service';

@Component({
  selector: 'app-payroll-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './payroll-page.component.html',
  styleUrls: ['./payroll-page.component.css'],
})
export class PayrollPageComponent implements OnInit, AfterViewInit {
  // Services
  private payrollService = inject(PayrollService);

  // ViewChild for animations
  @ViewChild('header', { static: true }) header!: ElementRef<HTMLElement>;
  @ViewChild('tableContainer', { static: true })
  tableContainer!: ElementRef<HTMLDivElement>;

  // Component State
  payrollData: PayrollRecord[] = [];
  isLoading = true;
  isExporting = false;
  errorMessage: string | null = null;

  // Date selectors state
  selectedMonth: number;
  selectedYear: number;
  availableYears: number[] = [];
  readonly months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  constructor() {
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedYear = today.getFullYear();
    this.generateYearList();
  }

  ngOnInit(): void {
    this.fetchPayroll();
  }

  ngAfterViewInit(): void {
    this.introAnimation();
  }

  /**
   * Lấy dữ liệu bảng lương từ service.
   */
  fetchPayroll(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.payrollService
      .getPayroll(this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (data) => {
          this.payrollData = data;
          this.isLoading = false;
          // Chạy animation cho bảng sau khi dữ liệu được tải
          setTimeout(() => this.animateTableRows(), 0);
        },
        error: (err) => {
          this.errorMessage =
            'Không thể tải dữ liệu bảng lương. Vui lòng thử lại sau.';
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  /**
   * Xử lý sự kiện khi người dùng thay đổi tháng hoặc năm.
   */
  onDateChange(): void {
    this.fetchPayroll();
  }

  /**
   * Xử lý việc xuất file Excel.
   */
  exportToExcel(): void {
    this.isExporting = true;
    this.payrollService
      .exportPayroll(this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (blob) => {
          saveAs(
            blob,
            `BangLuong_Thang_${this.selectedMonth}_${this.selectedYear}.xlsx`
          );
          this.isExporting = false;
        },
        error: (err) => {
          console.error('Lỗi khi xuất file Excel:', err);
          this.errorMessage = 'Xuất file không thành công.';
          this.isExporting = false;
        },
      });
  }

  /**
   * Tạo danh sách các năm để người dùng lựa chọn.
   */
  private generateYearList(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.availableYears.push(i);
    }
  }

  // --- GSAP ANIMATIONS ---

  private introAnimation(): void {
    gsap.from(this.header.nativeElement.children, {
      duration: 0.8,
      y: -50,
      autoAlpha: 0,
      stagger: 0.2,
      ease: 'power3.out',
    });
  }

  private animateTableRows(): void {
    gsap.from('.payroll-table tbody tr', {
      duration: 0.5,
      y: 30,
      autoAlpha: 0,
      stagger: 0.05,
      ease: 'power3.out',
    });
  }
}
