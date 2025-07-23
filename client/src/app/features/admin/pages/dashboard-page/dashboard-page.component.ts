import {
  Component,
  OnInit,
  inject,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { StatisticsService } from '../../../../core/services/statistics.service';
import { OverviewStats } from '../../../../core/models/statistics.model';

// Import Chart.js và GSAP
import { Chart, registerables } from 'chart.js';
import { gsap } from 'gsap';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css'],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  // Services
  private authService = inject(AuthService);
  private statisticsService = inject(StatisticsService);
  private cdr = inject(ChangeDetectorRef);

  // Component State
  userName = 'Admin';
  overviewStats: OverviewStats | null = null;
  isLoading = true;

  // ViewChild cho biểu đồ
  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    const decodedToken = this.authService.decodeToken();
    if (decodedToken) {
      this.userName = decodedToken.name;
    }
    this.fetchOverviewStats();
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
  }

  fetchOverviewStats(): void {
    this.isLoading = true;
    this.statisticsService.getOverviewStats().subscribe({
      next: (data) => {
        this.overviewStats = data;
        this.isLoading = false;
        this.cdr.detectChanges();

        // SỬA LỖI: Dùng setTimeout để đảm bảo DOM render xong trước khi chạy animation
        if (this.isBrowser) {
          setTimeout(() => {
            this.runAnimations();
            this.createRevenueChart();
          }, 0);
        }
      },
      error: (err) => {
        console.error('Failed to load overview stats:', err);
        this.isLoading = false;
      },
    });
  }

  createRevenueChart(): void {
    if (!this.revenueChartCanvas || !this.overviewStats) return;

    const ctx = this.revenueChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartInstance?.destroy();

    const profit = this.overviewStats.totalGrossProfit;
    const revenue = this.overviewStats.totalRevenue;

    // Màu sắc động dựa trên giá trị lợi nhuận
    const profitColor =
      profit >= 0 ? 'rgba(28, 200, 138, 0.8)' : 'rgba(231, 74, 59, 0.8)';
    const profitBorderColor =
      profit >= 0 ? 'rgba(28, 200, 138, 1)' : 'rgba(231, 74, 59, 1)';

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Tổng Doanh Thu', 'Lợi Nhuận Gộp'],
        datasets: [
          {
            label: 'VND',
            data: [revenue, profit],
            backgroundColor: ['rgba(78, 115, 223, 0.8)', profitColor],
            borderColor: ['rgba(78, 115, 223, 1)', profitBorderColor],
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.parsed.y.toLocaleString('vi-VN')} VNĐ`,
            },
          },
        },
        scales: {
          y: {
            grace: '10%', // Thêm 10% khoảng đệm cho trục Y
            ticks: {
              callback: (value) => {
                const numValue = Number(value);
                if (numValue === 0) return '0';
                if (Math.abs(numValue) >= 1000000) {
                  return `${numValue / 1000000}M`;
                }
                if (Math.abs(numValue) >= 1000) {
                  return `${numValue / 1000}K`;
                }
                return numValue;
              },
            },
          },
        },
      },
    });
  }

  runAnimations(): void {
    // SỬA LỖI: Bỏ hiệu ứng 3D cong vẹo, thay bằng hiệu ứng đơn giản hơn
    gsap.from('.main-header-dash > *', {
      duration: 0.8,
      y: -30,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out',
    });

    gsap.from('.stat-card', {
      duration: 0.7,
      opacity: 0,
      y: 40,
      stagger: 0.1,
      delay: 0.2,
      ease: 'power3.out',
    });

    gsap.from('.chart-container', {
      duration: 1,
      opacity: 0,
      y: 50,
      delay: 0.5,
      ease: 'power3.out',
    });
  }
}
