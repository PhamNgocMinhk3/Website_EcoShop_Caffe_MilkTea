import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  Inject,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';
import { StatisticsService } from '../../../../core/services/statistics.service';
import {
  RevenueDataPoint,
  ProductStat,
  ToppingStat,
  EmployeeRevenue,
  EmployeeAttendance,
  InventoryStats,
} from '../../../../core/models/statistics.model';

import { Chart, registerables } from 'chart.js';
import { gsap } from 'gsap';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.css'],
})
export class StatisticsPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  // Services
  private statisticsService = inject(StatisticsService);
  private cdr = inject(ChangeDetectorRef);
  private isBrowser: boolean;

  // Data properties
  isLoading = true;
  revenueData: RevenueDataPoint[] = [];
  productStats: {
    topByRevenue: ProductStat[];
    topByQuantity: ProductStat[];
    leastPopular: ProductStat[];
  } | null = null;
  topToppings: ToppingStat[] = [];
  topEmployees: EmployeeRevenue[] = [];
  employeeAttendance: EmployeeAttendance[] = [];
  inventoryStats: InventoryStats | null = null;

  // Chart instances
  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef<HTMLCanvasElement>;
  private revenueChart: Chart | null = null;

  private subscriptions = new Subscription();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.fetchAllData();
  }

  ngAfterViewInit(): void {
    // Animations will be triggered after data is fetched
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.revenueChart?.destroy();
  }

  fetchAllData(): void {
    this.isLoading = true;
    const data$ = forkJoin({
      revenue: this.statisticsService.getRevenueOverTime(),
      products: this.statisticsService.getProductStats(),
      toppings: this.statisticsService.getTopToppings(),
      employees: this.statisticsService.getTopEmployees(),
      attendance: this.statisticsService.getEmployeeAttendance(),
      inventory: this.statisticsService.getInventoryStats(),
    });

    this.subscriptions.add(
      data$.subscribe({
        next: (response) => {
          this.revenueData = response.revenue;
          this.productStats = response.products;
          this.topToppings = response.toppings;
          this.topEmployees = response.employees;
          this.employeeAttendance = response.attendance;
          this.inventoryStats = response.inventory;
          this.isLoading = false;
          this.cdr.detectChanges();
          if (this.isBrowser) {
            setTimeout(() => {
              this.createRevenueChart();
              this.runAnimations();
            }, 0);
          }
        },
        error: (err) => {
          console.error('Failed to load statistics data', err);
          this.isLoading = false;
        },
      })
    );
  }

  createRevenueChart(): void {
    if (!this.revenueChartCanvas || this.revenueData.length === 0) return;
    const ctx = this.revenueChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.revenueChart?.destroy();

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.revenueData.map((d) => d.date),
        datasets: [
          {
            label: 'Doanh Thu',
            data: this.revenueData.map((d) => d.revenue),
            borderColor: '#4e73df',
            backgroundColor: 'rgba(78, 115, 223, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Lợi Nhuận',
            data: this.revenueData.map((d) => d.profit),
            borderColor: '#1cc88a',
            backgroundColor: 'rgba(28, 200, 138, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: { callback: (value) => `${Number(value) / 1000}K` },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.parsed.y.toLocaleString(
                  'vi-VN'
                )} VNĐ`,
            },
          },
        },
      },
    });
  }

  runAnimations(): void {
    gsap.from('.stat-card', {
      duration: 0.8,
      opacity: 0,
      y: 50,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }
}
