import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  PLATFORM_ID,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { CartService } from '../../../core/services/cart.service';
import { CartItem, Topping } from '../../../core/models/product.model'; // Import thêm Topping
import { Subscription } from 'rxjs';

declare var gsap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  isCartOpen = false;
  isLoggedIn: boolean = false;
  cartItems: CartItem[] = [];

  private authStatusSubscription?: Subscription;
  private cartSubscription?: Subscription;

  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenService.getAccessToken();

    this.authStatusSubscription = this.authService.isLoggedIn$.subscribe(
      (status) => {
        this.isLoggedIn = status;
      }
    );

    this.cartSubscription = this.cartService.cartItems$.subscribe(
      (items: CartItem[]) => {
        this.cartItems = items;
        if (this.isBrowser) {
          this.cdr.detectChanges();
        }
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      gsap.from('.main-header', {
        duration: 1,
        y: -100,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.5,
      });
    }
  }

  ngOnDestroy(): void {
    this.authStatusSubscription?.unsubscribe();
    this.cartSubscription?.unsubscribe();
  }

  // --- HÀM MỚI ĐỂ SỬA LỖI TEMPLATE ---
  getToppingNames(toppings: Topping[]): string {
    if (!toppings || toppings.length === 0) {
      return 'Không có';
    }
    return toppings.map((t) => t.name).join(', ');
  }

  // Các hàm còn lại giữ nguyên
  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }
  goToCheckout(): void {
    this.isCartOpen = false;
    this.router.navigate(['/select-table']);
  }
  logout(): void {
    this.authService.logout();
  }

  increaseItemQuantity(item: CartItem): void {
    this.cartService.updateItemQuantity(item.uniqueId, item.quantity + 1);
  }
  decreaseItemQuantity(item: CartItem): void {
    this.cartService.updateItemQuantity(item.uniqueId, item.quantity - 1);
  }
  removeItem(item: CartItem): void {
    this.cartService.removeItemFromCart(item.uniqueId);
  }

  get totalCartItems() {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }
  get totalPrice() {
    return this.cartItems.reduce(
      (total, item) => total + item.finalPrice * item.quantity,
      0
    );
  }
}
