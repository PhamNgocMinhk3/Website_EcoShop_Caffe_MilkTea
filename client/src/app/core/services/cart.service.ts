import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Topping } from '../models/product.model';
import { NotificationService } from './notification.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private isBrowser: boolean;
  private cartItemsSource = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSource.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private notificationService: NotificationService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  loadCart(items: CartItem[]): void {
    this.cartItemsSource.next(items);
    this.saveCartToCookie();
  }

  // private loadCartFromCookie(): void {
  //   if (!this.isBrowser) return;
  //   const cartJson = this.getCookie('userCart');
  //   if (cartJson) {
  //     try {
  //       const items = JSON.parse(cartJson);
  //       this.cartItemsSource.next(items);
  //     } catch (e) {
  //       console.error('Lỗi parse giỏ hàng từ cookie:', e);
  //       this.clearCart();
  //     }
  //   }
  // }

  private saveCartToCookie(): void {
    if (!this.isBrowser) return;
    const cartJson = JSON.stringify(this.cartItemsSource.getValue());
    this.setCookie('userCart', cartJson, 30 * 24 * 60 * 60);
  }

  addToCart(itemToAdd: CartItem): void {
    const currentItems = [...this.cartItemsSource.getValue()];
    const existingItemIndex = currentItems.findIndex(
      (item) => item.uniqueId === itemToAdd.uniqueId
    );

    if (existingItemIndex > -1) {
      currentItems[existingItemIndex].quantity += itemToAdd.quantity;
    } else {
      currentItems.push(itemToAdd);
    }
    this.cartItemsSource.next(currentItems);
    this.saveCartToCookie();
    this.notificationService.show('Đã thêm vào giỏ hàng!', 'success');
  }

  updateItemQuantity(uniqueId: string, quantity: number): void {
    const currentItems = [...this.cartItemsSource.getValue()];
    const itemIndex = currentItems.findIndex(
      (item) => item.uniqueId === uniqueId
    );
    if (itemIndex > -1) {
      if (quantity > 0) {
        currentItems[itemIndex].quantity = quantity;
      } else {
        currentItems.splice(itemIndex, 1);
      }
      this.cartItemsSource.next(currentItems);
      this.saveCartToCookie();
    }
  }

  updateItemToppings(
    uniqueId: string,
    newToppings: Topping[],
    newFinalPrice: number
  ): void {
    const currentItems = [...this.cartItemsSource.getValue()];
    const itemIndex = currentItems.findIndex(
      (item) => item.uniqueId === uniqueId
    );
    if (itemIndex > -1) {
      currentItems[itemIndex].selectedToppings = newToppings;
      currentItems[itemIndex].finalPrice = newFinalPrice;
      this.cartItemsSource.next(currentItems);
      this.saveCartToCookie();
    }
  }

  removeItemFromCart(uniqueId: string): void {
    const currentItems = this.cartItemsSource
      .getValue()
      .filter((item) => item.uniqueId !== uniqueId);
    this.cartItemsSource.next(currentItems);
    this.saveCartToCookie();
  }

  clearCart(): void {
    this.cartItemsSource.next([]);
    this.saveCartToCookie();
  }

  private setCookie(name: string, value: string, maxAgeSeconds: number): void {
    if (!this.isBrowser) return;
    document.cookie = `${name}=${
      value || ''
    }; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    if (!this.isBrowser) return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}
