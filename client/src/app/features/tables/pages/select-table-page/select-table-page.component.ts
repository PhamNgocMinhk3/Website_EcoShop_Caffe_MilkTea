// PASTE VÀ THAY THẾ TOÀN BỘ CODE CŨ BẰNG CODE MỚI NÀY

import {
  Component,
  OnInit,
  inject,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Table } from '../../../../core/models/table.model';
import { TableService } from '../../../../core/services/table.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
// Thêm các import cần thiết
import { of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { CartItem } from '../../../../core/models/product.model';

declare var gsap: any;

@Component({
  selector: 'app-select-table-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './select-table-page.component.html',
  styleUrls: ['./select-table-page.component.css'],
})
export class SelectTablePageComponent implements OnInit, AfterViewInit {
  tables: Table[] = [];
  selectedTableId: number | null = null;
  isLoading = true;

  @ViewChildren('tableItemWrapper') tableWrappers!: QueryList<ElementRef>;

  private tableService = inject(TableService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private isBrowser: boolean;
  private cartService = inject(CartService);
  private orderService = inject(OrderService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.tableService.getTables().subscribe({
      next: (data: Table[]) => {
        this.tables = data;
        this.isLoading = false;
        this.cdr.detectChanges();
        if (this.isBrowser) {
          this.animateTablesIn();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notificationService.showError('Không thể tải danh sách bàn.');
        this.cdr.detectChanges();
      },
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      gsap.from('.title-container > *', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: 'power3.out',
        stagger: 0.2,
      });
    }
  }

  animateTablesIn(): void {
    if (!this.isBrowser || !this.tableWrappers) return;
    this.tableWrappers.changes.subscribe(() => {
      if (this.tableWrappers.length > 0) {
        gsap.from(
          this.tableWrappers.map((item) => item.nativeElement),
          {
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.1,
            ease: 'power3.out',
          }
        );
        this.addHoverListeners();
      }
    });
  }

  addHoverListeners(): void {
    if (!this.isBrowser) return;
    this.tableWrappers.forEach((wrapper) => {
      const el = wrapper.nativeElement;
      el.addEventListener('mouseenter', () => {
        gsap.to(el, { duration: 0.5, y: -10, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { duration: 0.5, y: 0, ease: 'power2.out' });
      });
    });
  }

  selectTable(table: Table): void {
    if (table.status !== 'Available') {
      this.notificationService.showError(
        table.status === 'Occupied'
          ? 'Bàn này đã có khách.'
          : 'Bàn này đang được bảo trì.'
      );
      return;
    }
    this.selectedTableId = table.id;
    this.cdr.detectChanges();
  }

  /**
   * [ĐÃ SỬA LỖI] Đảm bảo chỉ điều hướng sau khi API đã chạy xong.
   */
  confirmSelection(): void {
    if (this.selectedTableId === null) {
      this.notificationService.showError('Vui lòng chọn một bàn.');
      return;
    }

    this.isLoading = true;
    this.cartService.cartItems$
      .pipe(
        take(1), // Lấy giá trị hiện tại của giỏ hàng và ngắt subscription
        switchMap((cartItems: CartItem[]) => {
          if (cartItems && cartItems.length > 0) {
            // Nếu có giỏ hàng, gọi API để lưu
            return this.orderService.saveCartToSession(cartItems);
          }
          // Nếu giỏ hàng rỗng, trả về một Observable rỗng để tiếp tục luồng
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          // Chỉ điều hướng ở đây, sau khi `saveCartToSession` đã hoàn thành
          this.isLoading = false;
          this.router.navigate(['/checkout'], {
            queryParams: { tableId: this.selectedTableId },
          });
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Lỗi khi lưu giỏ hàng vào session:', err);
          this.notificationService.showError(
            'Có lỗi xảy ra, không thể tiếp tục.'
          );
        },
      });
  }
}
