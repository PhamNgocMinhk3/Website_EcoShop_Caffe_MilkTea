// Dán toàn bộ code này để thay thế file checkout-page.component.ts của bạn

import {
  Component,
  OnInit,
  inject,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { CartService } from '../../../../core/services/cart.service';
import { CartItem, Topping } from '../../../../core/models/product.model';
import { Voucher, CreateOrderDto } from '../../../../core/models/order.model';
import { PaymentMethod } from '../../../../core/models/PaymentMethod.model';
import { VoucherService } from '../../../../core/services/voucher.service';
import { OrderService } from '../../../../core/services/order.service';
import { ToppingService } from '../../../../core/services/topping.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';

declare var gsap: any;

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    CurrencyPipe,
  ],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css'],
})
export class CheckoutPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private cartService = inject(CartService);
  private voucherService = inject(VoucherService);
  private orderService = inject(OrderService);
  private toppingService = inject(ToppingService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private isBrowser: boolean;

  cartItems: CartItem[] = [];
  subTotal = 0;
  total = 0;
  appliedVoucher: Voucher | null = null;
  voucherCode = '';
  isPlacingOrder = false;
  bookingDetails = {
    tableId: 0,
    numberOfGuests: 1,
    date: '',
    time: '',
    paymentMethod: PaymentMethod.Cash,
  };
  availabilityMessage = '';
  isTimeSlotTaken = true;
  allToppings: Topping[] = [];
  editingItem: CartItem | null = null;
  tempSelectedToppings: { [key: number]: boolean } = {};
  vietQRUrl: string | null = null;
  PaymentMethod = PaymentMethod;

  private voucherInput$ = new Subject<string>();
  private availabilityCheck$ = new Subject<void>();
  private subscriptions = new Subscription();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.bookingDetails.tableId = Number(params.get('tableId'));
    });

    const sessionCartSub = this.orderService.getCartFromSession().subscribe({
      next: (items) => {
        if (!items || items.length === 0) {
          this.notificationService.show(
            'Giỏ hàng của bạn đang trống.',
            'error'
          );
          this.router.navigate(['/products']);
          return;
        }
        this.cartItems = items;
        this.cartService.loadCart(items);
        this.calculateTotals();
        this.loadAllToppings();
        this.setupVoucherCheck();
        this.setupAvailabilityCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching cart from session:', err);
        this.notificationService.showError('Không thể tải thông tin giỏ hàng.');
        this.router.navigate(['/products']);
      },
    });
    this.subscriptions.add(sessionCartSub);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      gsap.from('.info-card .animate-item', {
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.2,
      });
      gsap.from('.summary-card.animate-item', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.4,
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  calculateTotals(): void {
    this.subTotal = this.cartItems.reduce(
      (acc, item) => acc + item.finalPrice * item.quantity,
      0
    );
    const discount = this.appliedVoucher?.discountAmount ?? 0;
    this.total = Math.max(0, this.subTotal - discount);
    if (this.bookingDetails.paymentMethod === PaymentMethod.Card) {
      this.generateVietQR();
    }
  }

  setupVoucherCheck(): void {
    const voucherSub = this.voucherInput$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((code) =>
          !code
            ? of(null)
            : this.voucherService
                .applyVoucher(code)
                .pipe(catchError(() => of(null)))
        )
      )
      .subscribe((vouchers) => {
        const voucher = vouchers && vouchers.length > 0 ? vouchers[0] : null;
        if (voucher) {
          this.appliedVoucher = voucher;
          this.notificationService.show(
            'Áp dụng mã giảm giá thành công!',
            'success'
          );
        } else {
          this.appliedVoucher = null;
          if (this.voucherCode)
            this.notificationService.showError('Mã giảm giá không hợp lệ.');
        }
        this.calculateTotals();
        this.cdr.detectChanges();
      });
    this.subscriptions.add(voucherSub);
  }

  onVoucherInput(event: Event): void {
    this.voucherCode = (event.target as HTMLInputElement).value;
    this.voucherInput$.next(this.voucherCode);
  }

  setupAvailabilityCheck() {
    const availabilitySub = this.availabilityCheck$
      .pipe(debounceTime(500))
      .subscribe(() => this.checkTableAvailability());
    this.subscriptions.add(availabilitySub);
  }

  onDateTimeChange() {
    this.availabilityCheck$.next();
  }

  checkTableAvailability() {
    if (!this.bookingDetails.date || !this.bookingDetails.time) return;
    const bookingTime = new Date(
      `${this.bookingDetails.date}T${this.bookingDetails.time}:00`
    ).toISOString();
    this.orderService
      .checkAvailability(this.bookingDetails.tableId, bookingTime)
      .subscribe({
        next: () => {
          this.availabilityMessage = 'Bàn trống vào thời gian này.';
          this.isTimeSlotTaken = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.availabilityMessage =
            'Bàn đã có người đặt. Vui lòng chọn thời gian khác.';
          this.isTimeSlotTaken = true;
          this.bookingDetails.date = '';
          this.bookingDetails.time = '';
          this.cdr.detectChanges();
        },
      });
  }

  selectPayment(method: PaymentMethod) {
    if (method === PaymentMethod.Metamask) {
      this.notificationService.showError('Tính năng này đang được phát triển.');
      return;
    }
    this.bookingDetails.paymentMethod = method;
    if (method === PaymentMethod.Card) {
      this.generateVietQR();
    } else {
      this.vietQRUrl = null;
    }
  }

  generateVietQR() {
    const template = 'x';
    const accountNo = 'x';
    const accountName = 'x';
    const acqId = 'x';
    const amount = this.total;
    const addInfo = `Thanh toan don hang The Alley`;
    this.vietQRUrl = `https://img.vietqr.io/image/${acqId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(
      addInfo
    )}&accountName=${encodeURIComponent(accountName)}`;
  }
  placeOrder(): void {
    if (!this.bookingDetails.date || !this.bookingDetails.time) {
      this.notificationService.showError('Vui lòng chọn ngày và giờ đặt bàn.');
      return;
    }

    this.isPlacingOrder = true;

    const orderDto: CreateOrderDto = {
      tableId: this.bookingDetails.tableId,
      voucherId: this.appliedVoucher?.id ?? undefined,
      paymentMethod: this.bookingDetails.paymentMethod,
      numberOfGuests: this.bookingDetails.numberOfGuests,
      bookingTime: new Date(
        `${this.bookingDetails.date}T${this.bookingDetails.time}:00`
      ).toISOString(),
      items: this.cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        toppingIds: item.selectedToppings.map((t) => t.id),
      })),
    };

    this.orderService.createOrder(orderDto).subscribe({
      next: (response: any) => {
        if (response && response.paymentUrl) {
          this.notificationService.show(
            'Đang chuyển đến cổng thanh toán...',
            'info'
          );
          if (this.isBrowser) {
            window.location.href = response.paymentUrl;
          }
        } else {
          this.notificationService.show(
            'Đặt hàng thành công!',
            'success',
            5000
          );
          this.cartService.clearCart();
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.notificationService.showError(
          'Có lỗi xảy ra khi tạo đơn hàng, vui lòng thử lại.'
        );
        console.error(err);
        this.isPlacingOrder = false;
      },
    });
  }

  loadAllToppings(): void {
    this.toppingService.getToppings().subscribe((toppings) => {
      this.allToppings = toppings;
    });
  }

  editItem(item: CartItem): void {
    this.editingItem = {
      ...item,
      selectedToppings: [...item.selectedToppings],
    };
    this.tempSelectedToppings = {};
    item.selectedToppings.forEach((t) => {
      this.tempSelectedToppings[t.id] = true;
    });
    this.cdr.detectChanges();
  }

  closeToppingModal(): void {
    this.editingItem = null;
  }

  confirmToppingChanges(): void {
    if (!this.editingItem) return;
    const newSelectedToppings = this.allToppings.filter(
      (t) => this.tempSelectedToppings[t.id]
    );
    let basePriceForSize = this.editingItem.basePrice;
    if (this.editingItem.size === 'M') basePriceForSize += 3000;
    if (this.editingItem.size === 'L') basePriceForSize += 7000;
    const newFinalPrice = newSelectedToppings.reduce(
      (total, topping) => total + topping.price,
      basePriceForSize
    );
    this.cartService.updateItemToppings(
      this.editingItem.uniqueId,
      newSelectedToppings,
      newFinalPrice
    );
    this.closeToppingModal();
    this.notificationService.show('Đã cập nhật topping!', 'success');
  }

  getToppingNames(toppings: Topping[]): string {
    if (!toppings || toppings.length === 0) return 'Không có topping';
    return toppings.map((t) => t.name).join(', ');
  }
}
