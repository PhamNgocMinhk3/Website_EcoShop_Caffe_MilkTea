import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { OrderStatus, Order } from '../../../../core/models/order.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

declare var gsap: any;

@Component({
  selector: 'app-order-management-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, PaginationComponent],
  templateUrl: './order-management-page.component.html',
  styleUrls: ['./order-management-page.component.css'],
})
export class OrderManagementPageComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  OrderStatus = OrderStatus;
  expandedOrderId: number | null = null;

  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);
  private isBrowser: boolean;
  private cdr = inject(ChangeDetectorRef);

  private statusStringMap: { [key: string]: number } = {
    PendingBooking: 0,
    Confirmed: 1,
    Completed: 2,
    Paid: 2,
    Cancelled: 3,
  };

  paginatedOrders: Order[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (response: any) => {
        const items = response || [];
        this.orders = items.map((order: any) => ({
          ...order,
          status:
            typeof order.status === 'string'
              ? this.statusStringMap[order.status] ?? 0
              : order.status,
        }));

        this.totalPages = Math.ceil(this.orders.length / this.itemsPerPage);
        this.updatePaginatedOrders();

        this.isLoading = false;
        this.cdr.detectChanges();
        if (this.isBrowser && this.orders.length > 0) {
          setTimeout(() => this.animateRows(), 0);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.showError('Không thể tải danh sách đơn hàng.');
        console.error(err);
      },
    });
  }

  updatePaginatedOrders(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedOrders = this.orders.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedOrders();

    if (this.isBrowser) {
      setTimeout(() => this.animateRows(), 50);
    }
  }

  updateStatus(order: Order, event: any) {
    const newStatus = parseInt(event.target.value, 10);
    const originalStatus = order.status;
    order.status = newStatus;

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.notificationService.show('Cập nhật thành công!', 'success');
      },
      error: () => {
        order.status = originalStatus;
        this.notificationService.showError('Cập nhật trạng thái thất bại.');
        this.cdr.detectChanges();
      },
    });
  }

  updateCheckInStatus(order: Order) {
    const originalCheckIn = order.checkIn;
    order.checkIn = !order.checkIn;

    this.orderService.updateCheckInStatus(order.id).subscribe({
      next: () => {
        const message = order.checkIn
          ? 'Xác nhận khách đã đến!'
          : 'Hủy trạng thái đã đến.';
        this.notificationService.show(message, 'success');
      },
      error: () => {
        order.checkIn = originalCheckIn;
        this.notificationService.showError('Cập nhật check-in thất bại.');
        this.cdr.detectChanges();
      },
    });
  }

  toggleDetails(orderId: number, event: MouseEvent) {
    const wasExpanded = this.expandedOrderId === orderId;
    this.expandedOrderId = wasExpanded ? null : orderId;

    if (!wasExpanded && this.isBrowser) {
      setTimeout(() => {
        const row = (event.target as HTMLElement).closest('.order-row');
        const detailsWrapper =
          row?.nextElementSibling?.querySelector('.details-wrapper');
        if (detailsWrapper) {
          gsap.fromTo(
            detailsWrapper,
            { height: 0, opacity: 0 },
            { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.inOut' }
          );
        }
      }, 0);
    }
  }

  animateRows() {
    if (!this.isBrowser) return;
    gsap.utils.toArray('.order-row.gsap-animated').forEach((el: any) => {
      el.classList.remove('gsap-animated');
      gsap.set(el, { clearProps: 'opacity,transform' });
    });
    gsap.fromTo(
      '.order-row',
      { opacity: 0, y: 20 },
      {
        duration: 0.6,
        opacity: 1,
        y: 0,
        stagger: 0.08,
        ease: 'power3.out',
        onComplete: () => {
          gsap.utils
            .toArray('.order-row')
            .forEach((el: any) => el.classList.add('gsap-animated'));
        },
      }
    );
  }

  getStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      [OrderStatus.Pending]: 'Chờ xác nhận',
      [OrderStatus.Confirmed]: 'Đã xác nhận',
      [OrderStatus.Completed]: 'Hoàn thành',
      [OrderStatus.Cancelled]: 'Đã hủy',
    };
    return statusMap[status] || 'Không xác định';
  }

  getOrderStatusClass(status: number): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'status-pending';
      case OrderStatus.Confirmed:
        return 'status-confirmed';
      case OrderStatus.Completed:
        return 'status-completed';
      case OrderStatus.Cancelled:
        return 'status-cancelled';
      default:
        return '';
    }
  }
}
